const fs = require("fs");

function rot13(str) {
  return str.replace(/[a-zA-Z]/g, function (c) {
    const code = c.charCodeAt(0);
    const base = code >= 97 ? 97 : 65;
    return String.fromCharCode(((code - base + 13) % 26) + base);
  });
}

const plaintext = "CV{the_vault_needs_you}";
const ciphertext = rot13(plaintext);
const clue = "Forensic evidence package available at /challenges/stage4/evidence.zip";

console.log("=== STAGE 3 CRYPTOGRAPHY CHALLENGE GENERATOR ===");
console.log("Plaintext Flag:", plaintext);
console.log("ROT13 Ciphertext:", ciphertext);
console.log("Next Stage Clue:", clue);

// Verify decodability
const decoded = rot13(ciphertext);
if (decoded === plaintext) {
  console.log("Verification SUCCESS: Decoded text matches expected flag exactly!");
} else {
  console.error("Verification FAILURE: Decoded text does not match!");
  process.exit(1);
}
