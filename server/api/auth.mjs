// api/auth.mjs
import express from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import jwt from "jsonwebtoken";
import { verifyToken } from "../utils/authMiddleware.mjs";
import Debug from "debug";
const debug = Debug("api:auth");

// const users = [
// 	{ email: "user@example.com", password: "password123", name: "jegaj" },
// ];

passport.use(new LocalStrategy({
	usernameField: "email",
	passwordField: "password"
},
(email, password, done) => {
	debug(`Received email: ${email}, password: ${password}`);

	// Directly check hardcoded credentials
	if (email === "markusromaniw@gmx.de" && password === "123") {
		debug("Hardcoded credentials matched");
		return done(null, { email: "markusromaniw@gmx.de", name: "jegaj", id: 8 });
	} else {
		debug("Hardcoded credentials did not match");
		return done(null, false, { message: "Incorrect username or password." });
	}
}
));

const router = express.Router();

// Mock user data

router.post("/login", passport.authenticate("local", { session: false }), (req, res) => {
	debug("User login: ", req.user);
	const user = req.user; // Your authenticated user
	const email = user.email; // Get the user's email from the authenticated user
	const id =  8;
	const token = jwt.sign({ email, id }, "your JWT secret", { expiresIn: "148h" });
	debug("User login: ", user,  email);

	// Send both the user and the token in the response
	res.status(200).json({ user, token });
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
