/* eslint-disable quotes */
import jwt from 'jsonwebtoken';
import Debug from "debug";
const debug = Debug("utils:authMiddleware");

export function verifyToken(req, res, next) {
	const token = req.headers['authorization']?.split(' ')[1]; // Assuming token is sent as a Bearer token

	if (!token) {
		return res.status(403).send('A token is required for authentication');
	}

	try {
		const decoded = jwt.verify(token, 'your JWT secret');
		debug('Decoded token:', decoded);
		req.user = decoded;
		next(); // Call next() to continue to the route handler if the token is valid
	} catch (err) {
		return res.status(401).send('Invalid Token');
	}
}


export function extractEmailFromToken(req, res, next) {
	const authHeader = req.headers.authorization;
	if (authHeader && authHeader.startsWith('Bearer ')) {
		const token = authHeader.substring(7, authHeader.length); // Remove 'Bearer ' from the start

		try {
			const decoded = jwt.verify(token, 'your JWT secret');
			req.userEmail = decoded.email; // Attach the email to the request object
			req.id = decoded.id;
		} catch (error) {
			return res.status(401).json({ error: 'Invalid token' });
		}
	} else {
		return res.status(401).json({ error: 'Authorization header missing or invalid' });
	}
	next();
};
