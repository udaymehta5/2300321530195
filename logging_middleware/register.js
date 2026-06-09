/**
 * Run this ONCE to get your clientID and clientSecret:
 *   node register.js
 * 
 * FILL IN YOUR DETAILS BELOW FIRST
 */

const API_BASE = "http://4.224.186.213/evaluation-service";

// ── FILL THESE IN ─────────────────────────────────────────────────────────────
const EMAIL          = "YOUR_COLLEGE_EMAIL";       // e.g. 2300321530195@aktu.ac.in
const NAME           = "YOUR_FULL_NAME";           // e.g. Uday Mishra
const MOBILE         = "YOUR_10_DIGIT_MOBILE";     // e.g. 9876543210
const GITHUB_USERNAME = "YOUR_GITHUB_USERNAME";    // just username, not full URL
const ROLL_NO        = "2300321530195";            // your roll number
const ACCESS_CODE    = "YOUR_ACCESS_CODE";         // short code from Affordmed email
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Sending registration request...\n");

  try {
    const res = await fetch(API_BASE + "/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email:          EMAIL,
        name:           NAME,
        mobileNo:       MOBILE,
        githubUsername: GITHUB_USERNAME,
        rollNo:         ROLL_NO,
        accessCode:     ACCESS_CODE,
      }),
    });

    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Raw response:", text);

    try {
      const data = JSON.parse(text);
      if (data.clientID) {
        console.log("\n✅ SUCCESS! Copy these into your index.js CONFIG:");
        console.log("   clientID:    ", data.clientID);
        console.log("   clientSecret:", data.clientSecret);
      } else {
        console.log("\n❌ No clientID in response. Full data:", data);
      }
    } catch {
      console.log("Could not parse as JSON.");
    }

  } catch (err) {
    console.log("❌ Network error:", err.message);
  }
}

main();