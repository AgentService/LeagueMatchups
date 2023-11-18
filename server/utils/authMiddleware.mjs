/* eslint-disable quotes */
import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
	const token = req.headers['authorization']?.split(' ')[1]; // Assuming token is sent as a Bearer token

	if (!token) {
		return res.status(403).send('A token is required for authentication');
	}

	try {
		const decoded = jwt.verify(token, 'your JWT secret');
		console.log('decoded:', decoded);
		req.user = decoded;
		next(); // Call next() to continue to the route handler if the token is valid
	} catch (err) {
		return res.status(401).send('Invalid Token');
	}
}
