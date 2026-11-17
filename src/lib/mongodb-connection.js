const { execFileSync } = require("node:child_process");
const dns = require("node:dns");
const { isIP } = require("node:net");
const mongoose = require("mongoose");

const LOCAL_MONGODB_URI = "mongodb://127.0.0.1:27017/cybervault_ctf";
const SERVER_SELECTION_TIMEOUT_MS = 8000;

function getWindowsDnsServers() {
  if (process.platform !== "win32") {
    return [];
  }

  const command =
    "$ErrorActionPreference='Stop'; @(Get-DnsClientServerAddress | ForEach-Object { $_.ServerAddresses } | Where-Object { $_ } | Select-Object -Unique) | ConvertTo-Json -Compress";
  const result = execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", command], {
    encoding: "utf8",
    timeout: 5000,
    windowsHide: true,
  }).trim();

  if (!result) {
    return [];
  }

  const parsed = JSON.parse(result);
  const servers = Array.isArray(parsed) ? parsed : [parsed];
  return servers.filter((server) => typeof server === "string" && isIP(server));
}

function getDnsServers() {
  const configuredServers = (process.env.MONGODB_DNS_SERVERS || "")
    .split(",")
    .map((server) => server.trim())
    .filter((server) => isIP(server));
  const nodeServers = dns.getServers();
  const usesLoopbackOnly =
    nodeServers.length > 0 &&
    nodeServers.every((server) => server === "127.0.0.1" || server === "::1");
  const systemServers = usesLoopbackOnly ? getWindowsDnsServers() : [];

  return [...new Set([...configuredServers, ...nodeServers, ...systemServers])];
}

function makeSeedListUri(uri, srvRecords, txtRecords) {
  const parsed = new URL(uri);
  const hosts = srvRecords
    .map((record) => `${record.name.replace(/\.$/, "")}:${record.port}`)
    .join(",");
  const database = parsed.pathname.replace(/^\/+/, "") || "cybervault_ctf";
  const options = new URLSearchParams();

  for (const record of txtRecords) {
    for (const [key, value] of new URLSearchParams(record.join(""))) {
      if ((key === "authSource" || key === "replicaSet") && !parsed.searchParams.has(key)) {
        options.set(key, value);
      }
    }
  }

  for (const [key, value] of parsed.searchParams) {
    options.set(key, value);
  }

  options.set("tls", "true");
  const credentials = parsed.username
    ? `${parsed.username}${parsed.password ? `:${parsed.password}` : ""}@`
    : "";

  return `mongodb://${credentials}${hosts}/${database}?${options.toString()}`;
}

async function resolveSeedListUri(uri) {
  const parsed = new URL(uri);
  const dnsServers = getDnsServers();
  let lastError;

  for (const server of dnsServers) {
    const resolver = new dns.promises.Resolver();
    resolver.setServers([server]);

    try {
      const [srvRecords, txtRecords] = await Promise.all([
        resolver.resolveSrv(`_mongodb._tcp.${parsed.hostname}`),
        resolver.resolveTxt(parsed.hostname).catch((error) => {
          if (error.code === "ENODATA" || error.code === "ENOTFOUND") {
            return [];
          }
          throw error;
        }),
      ]);

      if (srvRecords.length) {
        return makeSeedListUri(uri, srvRecords, txtRecords);
      }
    } catch (error) {
      lastError = error;
    }
  }

  const dnsDetail = lastError instanceof Error ? `${lastError.code || lastError.name}: ${lastError.message}` : "No DNS servers are configured";
  throw new Error(
    `Could not resolve the MongoDB Atlas SRV record (${dnsDetail}). Configure MONGODB_DNS_SERVERS with a reachable DNS server if needed.`
  );
}

async function connectMongo(uri = process.env.MONGODB_URI || LOCAL_MONGODB_URI) {
  let configuredUri = uri.trim();

  if (!configuredUri) {
    configuredUri = LOCAL_MONGODB_URI;
  }

  if (configuredUri.startsWith("mongodb+srv://")) {
    try {
      return await mongoose.connect(configuredUri, {
        serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
      });
    } catch (originalError) {
      const seedListUri = await resolveSeedListUri(configuredUri);
      try {
        return await mongoose.connect(seedListUri, {
          serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
        });
      } catch (fallbackError) {
        throw new Error(
          `MongoDB connection failed after the SRV fallback: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`,
          { cause: originalError }
        );
      }
    }
  }

  return mongoose.connect(configuredUri, {
    serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
  });
}

module.exports = { connectMongo };
