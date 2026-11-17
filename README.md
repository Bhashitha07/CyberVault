# CyberVault CTF - Web-Based Play Box

CyberVault CTF is an educational, web-based Capture The Flag (CTF) platform built for penetration testing labs. It features a 6-stage progressive investigation pathway powered by Next.js, React, Node.js, and MongoDB.

---

## 🚀 Quick Setup & Installation

### 1. Prerequisites
- **Node.js**: v20.0.0 or higher
- **Docker Desktop** (for local MongoDB), or a MongoDB Atlas cluster.

### 2. Environment Configuration
Create or update `.env.local` in the root directory:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/cybervault_ctf
AUTH_SECRET=replace-with-a-long-random-secret-key
ADMIN_PASSWORD=optional-local-admin-password
```

`ADMIN_PASSWORD` is only needed to create or update the admin account. Keep it in your untracked `.env.local`; the project does not include a built-in admin password.

*Note: For MongoDB Atlas, format your string as follows:*
```env
MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/cybervault_ctf
```

If your environment blocks SRV DNS lookups, the app attempts a direct Atlas seed-list connection using the system DNS servers.

On Windows, the app and seed scripts retry Atlas SRV resolution using the system DNS servers if Node.js is configured to use an unavailable loopback DNS server. You can optionally set `MONGODB_DNS_SERVERS` to a comma-separated list of reachable DNS server IPs.

### 3. Start the Local Database
Start Docker Desktop, then start the MongoDB container from the project root:
```bash
npm run db:up
```
The command waits for MongoDB to become healthy. Data is kept in a Docker volume when the container is stopped. To stop the database:
```bash
npm run db:down
```
Skip this step if using MongoDB Atlas.

### 4. Install Dependencies
```bash
npm install
```

### 5. Seed Database Challenges
Seed the 6 CTF stages into your MongoDB database. This does not require `ADMIN_PASSWORD`:
```bash
npm run seed
```

### 6. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 7. Create Accounts
Create a player account from the **Create account** link. There is no built-in player password.

To create or update the admin account, set `ADMIN_PASSWORD` in `.env.local` and run:
```bash
npm run seed:admin
```

---

## 🛠️ Verification with MongoDB Compass

To inspect persistent user, challenge, and progress data:

1. Launch **MongoDB Compass**.
2. Connect to URI: `mongodb://127.0.0.1:27017`
3. Select database: `cybervault_ctf`
4. Inspect the target collections:
   - `users`: Registered CTF player accounts, hashed passwords, scores, and completed stages.
   - `challenges`: Metadata and server-side flag validation information for all 6 CTF stages.
   - `userprogresses`: Per-user stage attempts, completion statuses, and timestamps.
   - `progresses`: Overall user progress metrics and total scores.

---

## 🔒 Security Architecture

- **Server-Side Flag Validation**: Expected challenge flags (`CV{...}`) are strictly stored and validated on the server side (`POST /api/flags/submit`). Flags are never exposed in API responses or client-side JavaScript bundles.
- **Isolated Challenge Labs**: Intentionally vulnerable services (e.g. Stage 2 Broken Login and Stage 6 Linux Lab) operate in isolated Docker/VM lab environments separate from the main platform authentication.
- **Progress Validation**: Stage unlocking and scoring are validated server-side to prevent client bypass.
