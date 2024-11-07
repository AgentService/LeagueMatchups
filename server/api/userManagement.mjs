import express from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import Debug from "debug";
import { snakeToCamelCase } from "./utilities.mjs";
import SibApiV3Sdk from "sib-api-v3-sdk";
import dotenv from 'dotenv';
dotenv.config();

const debug = Debug("api:userManagement");
const router = express.Router();

// User Registration Endpoint
router.post("/register", async (req, res) => {
  const { dbPool } = req.app.locals;
  const { username, email, password, testEmail } = req.body;

  debug("registering user");

  // Generate verification token
  const verificationToken = uuidv4();

  try {
    console.log("Checking for existing user with email:", email);
    console.log("testEmail:", testEmail);

    if (!testEmail) {
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert the new user into the database
      const result = await dbPool.query(
        "INSERT INTO Users (username, Email, Password_Hash, verification_token) VALUES ($1, $2, $3, $4) RETURNING user_id, username, Email",
        [username, email, hashedPassword, verificationToken]
      );
      let newUser = result.rows[0];
      newUser = snakeToCamelCase(newUser);

      // Send verification email
      await sendVerificationEmail(email, verificationToken);

      // Respond with the new user (excluding password hash)
      res.status(201).json({ user: newUser });
    } else {
      // Send verification email for testing
      await sendVerificationEmail(email, verificationToken);
      res.status(200).json({ message: "Verification email sent for testing" });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
});

// Function to send verification email
async function sendVerificationEmail(email, verificationToken) {
  // Use the Brevo API key from environment variables
  const brevoApiKey = process.env.BREVO_API_KEY;
  console.log("Sending verification email to:", email);
  // Configure Brevo SDK
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = brevoApiKey;
  console.log("Brevo API key:", brevoApiKey);
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.to = [{ email }];
  sendSmtpEmail.sender = {
    email: "hello@skyquads.com",
    name: "SoloQ",
  };
  console.log("Verification token:", verificationToken);
  sendSmtpEmail.subject = "Account Verification";
  sendSmtpEmail.htmlContent = `<p>Please verify your account by clicking the following link: <a href="${process.env.VITE_API_BASE_URL}/api/user/verify/${verificationToken}">Verify Account</a></p>`;

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Verification email sent successfully.");
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
}

// Email Verification Endpoint
router.get("/verify/:token", async (req, res) => {
  const { token } = req.params;
  const { dbPool } = req.app.locals;
  console.log("Verifying user with token:", token);

  try {
    const result = await dbPool.query(
      "UPDATE Users SET verified = true, verification_token = null WHERE verification_token = $1 RETURNING *",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).send("Invalid or expired token.");
    }

    const user = result.rows[0];
    debug("User verified: ", user);

    res.status(200).send("Account verified successfully.");
  } catch (error) {
    console.error("Error during email verification", error);
    res.status(500).send("Internal Server Error during email verification.");
  }
});

export default router;
