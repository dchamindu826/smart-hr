const crypto = require("crypto");
const https = require("https");
const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const KEY_ID = process.env.APP_STORE_CONNECT_KEY_ID;
const ISSUER_ID = process.env.APP_STORE_CONNECT_ISSUER_ID || "b1a9061f-7ca4-4e00-9190-e492c2bc3b77";
const privateKey = process.env.APP_STORE_CONNECT_PRIVATE_KEY;

if (!KEY_ID || !privateKey) {
  console.error("Missing APP_STORE_CONNECT_KEY_ID or APP_STORE_CONNECT_PRIVATE_KEY");
  process.exit(1);
}

function base64url(str) { return Buffer.from(str).toString("base64url"); }

function getJwt() {
  const header = { alg: "ES256", kid: KEY_ID, typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: ISSUER_ID, iat: now, exp: now + 1200, aud: "appstoreconnect-v1" };
  const tokenHeaderAndPayload = base64url(JSON.stringify(header)) + "." + base64url(JSON.stringify(payload));
  const signature = crypto.sign(null, Buffer.from(tokenHeaderAndPayload), { key: privateKey, dsaEncoding: "ieee-p1363" });
  return tokenHeaderAndPayload + "." + signature.toString("base64url");
}

function ascRequest(method, endpoint) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: "api.appstoreconnect.apple.com",
      path: encodeURI(endpoint),
      method: method,
      headers: {
        "Authorization": "Bearer " + getJwt(),
        "User-Agent": "AppStoreConnectClient"
      }
    }, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

async function setup() {
  const tempDir = process.env.RUNNER_TEMP || "/tmp";
  const homeDir = process.env.HOME;

  console.log("=== 1. Fetching App Store Provisioning Profile from Apple ===");
  const profilesRes = await ascRequest("GET", "/v1/profiles?filter[profileType]=IOS_APP_STORE&include=certificates,bundleId&limit=20");
  
  if (profilesRes.status !== 200) {
    console.error("Failed to list profiles:", profilesRes.body);
    process.exit(1);
  }

  const smartHrProfile = profilesRes.body.data.find(p => p.attributes.name.includes("SmartHR"));
  if (!smartHrProfile) {
    console.error("SmartHR App Store profile not found in Apple account!");
    process.exit(1);
  }

  console.log("Found profile:", smartHrProfile.attributes.name, "UUID:", smartHrProfile.attributes.uuid);
  const ppDir = path.join(homeDir, "Library", "MobileDevice", "Provisioning Profiles");
  fs.mkdirSync(ppDir, { recursive: true });

  const profileContent = Buffer.from(smartHrProfile.attributes.profileContent, "base64");
  fs.writeFileSync(path.join(ppDir, `${smartHrProfile.attributes.uuid}.mobileprovision`), profileContent);
  fs.writeFileSync(path.join(ppDir, "profile.mobileprovision"), profileContent);
  console.log("Installed Provisioning Profile successfully.");

  console.log("\n=== 2. Setting up Apple Distribution Certificate & Keychain ===");
  const keychainPath = path.join(tempDir, "build.keychain");
  const keychainPass = "temp_signing_pass_2026";

  try { execSync(`security delete-keychain "${keychainPath}"`); } catch (e) {}
  execSync(`security create-keychain -p "${keychainPass}" "${keychainPath}"`);
  execSync(`security set-keychain-settings -lut 21600 "${keychainPath}"`);
  execSync(`security unlock-keychain -p "${keychainPass}" "${keychainPath}"`);

  // Decode input cert
  const rawBase64 = process.env.BUILD_CERTIFICATE_BASE64 || "";
  const decodedBuffer = Buffer.from(rawBase64.trim(), "base64");
  const rawInputPath = path.join(tempDir, "raw_cert.bin");
  fs.writeFileSync(rawInputPath, decodedBuffer);

  const decodedStr = decodedBuffer.toString("utf8");
  if (decodedStr.includes("-----BEGIN")) {
    console.log("Input is PEM format. Importing directly...");
    execSync(`security import "${rawInputPath}" -k "${keychainPath}"`);
  } else {
    console.log("Input is PKCS12 format. Converting to PEM via OpenSSL...");
    const p12Pass = process.env.P12_PASSWORD || "smarthrpassword2026";
    const pemConvertedPath = path.join(tempDir, "converted.pem");
    try {
      execSync(`openssl pkcs12 -legacy -in "${rawInputPath}" -nodes -passin pass:"${p12Pass}" -out "${pemConvertedPath}"`);
    } catch (e) {
      execSync(`openssl pkcs12 -in "${rawInputPath}" -nodes -passin pass:"${p12Pass}" -out "${pemConvertedPath}"`);
    }
    execSync(`security import "${pemConvertedPath}" -k "${keychainPath}"`);
  }

  execSync(`security list-keychains -d user -s "${keychainPath}" $(security list-keychains -d user | tr -d '"')`);
  execSync(`security set-key-partition-list -S apple-tool:,apple: -s -k "${keychainPass}" "${keychainPath}"`);

  console.log("\n=== 3. Verifying Keychain Code Signing Identity ===");
  const identity = execSync(`security find-identity -p codesigning "${keychainPath}"`).toString();
  console.log(identity);

  if (!identity.includes("Apple Distribution")) {
    console.error("Apple Distribution identity was not found in keychain!");
    process.exit(1);
  }

  console.log("Setup completed successfully! Ready for Xcode archive and export.");
}

setup().catch(err => {
  console.error("Setup error:", err);
  process.exit(1);
});
