// authMiddleware.mjs
/* eslint-disable quotes */
import jwt from "jsonwebtoken";
import Debug from "debug";
const debug = Debug("api:authMiddleware");

// authMiddleware.mjs
import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  // Extract the token from the authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // Check if the token is missing
  if (!token) {
    return res.status(401).json({ message: "Access token is required" });
  }

  // Verify the token using JWT
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: "Access token has expired" });
      }
      return res.status(403).json({ message: "Invalid access token" });
    }

    // Attach user information from the decoded token to req.user
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role, // Attach role to req.user for role-based access
    };

    // Continue to the next middleware or route handler
    next();
  });
}


export function extractEmailFromToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7, authHeader.length); // Remove 'Bearer ' from the start

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userEmail = decoded.email; // Attach the email to the request object
      req.id = decoded.id;
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
    }
  } else {
    return res
      .status(401)
      .json({ error: "Authorization header missing or invalid" });
  }
  next();
}
