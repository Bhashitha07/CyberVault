# CyberVault CTF - Challenge Implementation & Solution Guide
**Course:** IE3132 - Penetration Testing  
**Project:** CyberVault CTF Play Box  

---

## 📌 Executive Summary
CyberVault CTF features a 6-stage progressive penetration testing pathway designed for beginner-to-intermediate cybersecurity students. Every stage is a real, solvable security investigation covering Steganography, Web Security, Cryptography, Digital Forensics, Networking, and Linux System Security.

---

## 🚩 Master Flag Registry (Server-Side Only)

| Stage | Domain | Title | Difficulty | Expected Flag | Points |
|---|---|---|---|---|---|
| **Stage 1** | Steganography | Hidden in Plain Sight | Easy | `CV{vault_01_hidden_data}` | 100 |
| **Stage 2** | Web Security | Broken Login | Easy | `CV{vault_02_broken_login}` | 100 |
| **Stage 3** | Cryptography | The Forgotten Cipher | Moderate | `CV{the_vault_needs_you}` | 150 |
| **Stage 4** | Digital Forensics | Evidence Trail | Moderate | `CV{forensics_finds_the_clue}` | 150 |
| **Stage 5** | Networking | Packet Hunter | Moderate-Hard | `CV{packet_hunter}` | 200 |
| **Stage 6** | Linux Security | The Final Breach | Hard | `CV{the_final_breach}` | 300 |

*Total Points:* **1000**

---

## 🔍 Stage Specifications & Intended Solutions

### Stage 1: Hidden in Plain Sight
* **Domain:** Steganography
* **Difficulty:** Easy
* **Scenario:** An image recovered from the compromised system appears ordinary, but investigators suspect hidden data inside it.
* **Learning Objective:** Understand digital steganography, file structure metadata, and basic command-line file inspection tools.
* **Challenge Environment:** Downloadable PNG image (`/challenges/stage1/challenge.png`).
* **Player Task:** Download the image, inspect contents using CLI tools, and recover the flag and Stage 2 clue.
* **Required Tools:** `strings`, `exiftool`, `hexdump`
* **Intended Solution Path:**
  1. Download `challenge.png` from Stage 1 page.
  2. Run command: `strings challenge.png | grep "FLAG"`
  3. Extract flag: `CV{vault_01_hidden_data}`
  4. Extract Stage 2 clue: `"Employee portal authentication may not be what it seems. Access local portal at /challenges/stage2/portal"`
* **Reset/Recovery:** Re-run `node scripts/generate-stage1.js`.

---

### Stage 2: Broken Login
* **Domain:** Web Security
* **Difficulty:** Easy
* **Scenario:** Information from Stage 1 leads the investigator to an internal employee portal with weak authentication control.
* **Learning Objective:** Identify insecure client-side parameter controls and manipulate request payloads using Browser DevTools or proxy tools.
* **Challenge Environment:** Isolated Employee Access Portal (`/challenges/stage2/portal`).
* **Player Task:** Inspect authentication requests, bypass authorization check, and recover the protected portal flag.
* **Required Tools:** Browser DevTools (Network Tab) or Burp Suite Community Edition.
* **Intended Solution Path:**
  1. Open `/challenges/stage2/portal`.
  2. Inspect HTTP request payload sent to `/api/challenges/stage2/login`.
  3. Notice parameter `"role": "guest"`.
  4. Change `"role"` parameter value strictly to `"employee"` (access restricted to employee role only; admin and guest are rejected).
  5. Submit login request.
  6. Access granted screen displays flag: `CV{vault_02_broken_login}` and Stage 3 clue: `"Attacker left an encrypted cipher message and you have to find it."`.
* **Reset/Recovery:** Session state resets automatically per request.

---

### Stage 3: The Forgotten Cipher
* **Domain:** Cryptography
* **Difficulty:** Moderate
* **Scenario:** The employee portal contains an encrypted attacker message (`PI{gur_inhyg_arrqf_lbh}`).
* **Learning Objective:** Recognize classical shift ciphers (Caesar / ROT13) and apply decryption techniques.
* **Challenge Environment:** Text-based cryptography payload on Stage 3 page.
* **Player Task:** Identify cipher shift, decrypt message, and recover flag.
* **Required Tools:** CyberChef, Python (`codecs.decode(c, 'rot_13')`), or manual shift.
* **Intended Solution Path:**
  1. Take ciphertext `PI{gur_inhyg_arrqf_lbh}`.
  2. Apply ROT13 / shift 13 transformation.
  3. Decrypted output yields flag: `CV{the_vault_needs_you}`.
  4. Reveals Stage 4 clue: `"Forensic evidence package available at /challenges/stage4/evidence.zip"`.
* **Reset/Recovery:** Re-run `node scripts/generate-stage3-cipher.js`.

---

### Stage 4: Evidence Trail
* **Domain:** Digital Forensics
* **Difficulty:** Moderate
* **Scenario:** The decrypted message points to system log evidence from the compromised host.
* **Learning Objective:** Correlate log artifacts, identify unauthorized access, and decode encoded payloads.
* **Challenge Environment:** Forensic Evidence Archive (`/challenges/stage4/evidence.zip`).
* **Player Task:** Download evidence zip, search logs, locate encoded artifact, and decode it.
* **Required Tools:** `grep`, `cat`, `base64`
* **Intended Solution Path:**
  1. Download and extract `evidence.zip`.
  2. Inspect `auth.log`: `grep "artifact" auth.log`
  3. Locate referenced file: `notes/encoded_artifact.txt`.
  4. Read Base64 payload and decode: `cat notes/encoded_artifact.txt | grep -v "^-" | base64 --decode`
  5. Recover flag: `CV{forensics_finds_the_clue}` and Stage 5 clue: `"Investigate network packet capture /challenges/stage5/challenge.pcap"`.
* **Reset/Recovery:** Re-run `node scripts/generate-stage4-evidence.js`.

---

### Stage 5: Packet Hunter
* **Domain:** Networking
* **Difficulty:** Moderate-Hard
* **Scenario:** Network traffic capture contains attacker exfiltration communications.
* **Learning Objective:** Analyze PCAP files, inspect TCP/HTTP streams, and extract encoded network payloads.
* **Challenge Environment:** Packet capture file (`/challenges/stage5/challenge.pcap`).
* **Player Task:** Open PCAP, filter HTTP GET traffic, extract base64 parameter, and decode payload.
* **Required Tools:** Wireshark, TShark, or CLI packet tools.
* **Intended Solution Path:**
  1. Download `challenge.pcap`.
  2. Open in Wireshark and filter `http` or search `exfil`.
  3. Locate stream GET request: `/exfil?data=RkxBRzogQ1Z7cGFja2V0X2h1bnRlcn0...`
  4. Decode Base64 string:
     `echo "RkxBRzogQ1Z7cGFja2V0X2h1bnRlcn0..." | base64 --decode`
  5. Recover flag: `CV{packet_hunter}` and Stage 6 access clue: `"Target: stage6-lab | User: analyst | Service: SSH/http"`.
* **Reset/Recovery:** Re-run `node scripts/generate-stage5-pcap.js`.

---

### Stage 6: The Final Breach
* **Domain:** Linux / System Security
* **Difficulty:** Hard
* **Scenario:** Information from Stage 5 identifies an isolated Linux server connected to the incident.
* **Learning Objective:** System enumeration, privilege escalation analysis, and sudo misconfiguration exploitation.
* **Challenge Environment:** In-browser Terminal (`/challenges/stage6/terminal`) / Docker Container (`docker/stage6/`).
* **Player Task:** Connect as user `analyst`, enumerate local permissions, exploit sudo misconfiguration, and read protected flag.
* **Required Tools:** `whoami`, `id`, `ls -la`, `sudo -l`, `sudo find`
* **Intended Solution Path:**
  1. Open `/challenges/stage6/terminal`.
  2. Check current user: `whoami` -> `analyst`.
  3. Enumerate sudo permissions: `sudo -l`
  4. Discover misconfiguration: `(ALL : ALL) NOPASSWD: /usr/bin/find`.
  5. Escalate privilege to read protected file:
     `sudo find /opt/cybervault -name final_flag.txt -exec cat {} \;`
  6. Recover final flag: `CV{the_final_breach}`.
* **Reset/Recovery:** Re-deploy container or restart terminal session.

---

## 🛠️ Automated Challenge Generation Commands
All challenge assets can be regenerated cleanly using the built-in generator scripts:

```bash
node scripts/generate-stage1.js
node scripts/generate-stage3-cipher.js
node scripts/generate-stage4-evidence.js
node scripts/generate-stage5-pcap.js
```
