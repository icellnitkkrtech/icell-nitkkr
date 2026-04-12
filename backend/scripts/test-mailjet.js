import dotenv from "dotenv";
dotenv.config();
import mailjet from "node-mailjet";

async function testMailjet() {
  const apiKey = process.env.MAILJET_API_KEY;
  const apiSecret = process.env.MAILJET_API_SECRET;

  console.log("🔍 Testing Mailjet Connection...\n");
  console.log("API Key:", apiKey ? `${apiKey.substring(0, 10)}...` : "NOT SET");
  console.log(
    "API Secret:",
    apiSecret ? `${apiSecret.substring(0, 10)}...` : "NOT SET"
  );

  if (!apiKey || !apiSecret) {
    console.error("❌ Mailjet credentials not configured!");
    process.exit(1);
  }

  const client = mailjet.apiConnect(apiKey, apiSecret);

  try {
    console.log("\n📧 Attempting to send test email...\n");

    const response = await client.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_FROM_EMAIL || "noreply@nitkkr.ac.in",
            Name: "NITKKR Test",
          },
          To: [
            {
              Email: process.env.MAILJET_TEST_EMAIL || "test@nitkkr.ac.in",
              Name: "Test User",
            },
          ],
          Subject: "Mailjet Connection Test",
          TextPart: "If you receive this, Mailjet is working correctly!",
          HTMLPart:
            "<p>If you receive this, <strong>Mailjet is working correctly!</strong></p>",
        },
      ],
    });

    console.log("✅ Test email sent successfully!");
    console.log("Response:", response.body);
    process.exit(0);
  } catch (error) {
    console.error("❌ Mailjet Error:");
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error("Status:", error.statusCode);
    if (error.response?.data) {
      console.error("Details:", JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testMailjet();
