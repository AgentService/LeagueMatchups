// api/auth.mjs
import Debug from "debug";
import express from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import jwt from "jsonwebtoken";
import { verifyToken } from "../utils/authMiddleware.mjs";

const debugApi = Debug("api");

// const users = [
// 	{ email: "user@example.com", password: "password123", name: "jegaj" },
// ];

passport.use(new LocalStrategy({
	usernameField: "email",
	passwordField: "password"
},
(email, password, done) => {
	debugApi(`Received email: ${email}, password: ${password}`);

	// Directly check hardcoded credentials
	if (email === "user@example.com" && password === "password123") {
		debugApi("Hardcoded credentials matched");
		return done(null, { email: "user@example.com", name: "jegaj" });
	} else {
		debugApi("Hardcoded credentials did not match");
		return done(null, false, { message: "Incorrect username or password." });
	}
}
));

const router = express.Router();

// Mock user data

router.post("/login", passport.authenticate("local", { session: false }), (req, res) => {
	const user = req.user; // Your authenticated user
	const email = user.email; // Get the user's email from the authenticated user
	const token = jwt.sign({ email }, "your JWT secret", { expiresIn: "48h" });
	debugApi("asd", user,  email, token);

	// Send both the user and the token in the response
	res.json({ user, token });
});

// Token Verification Endpoint
router.post("/verifyToken", verifyToken, (req, res) => {
	// If the token is valid, the user information will be in req.user
	const user = req.user;

	if (!user) {
		return res.status(401).send("Invalid Token");
	}

	// Assuming you want to return some user info (adjust as needed)
	res.json({ user: { email: user.email, name: user.name } });
});

export default router;
