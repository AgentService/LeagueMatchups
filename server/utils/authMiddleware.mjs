import jwt from "jsonwebtoken";
import { getNamespaceLogger, logInfo, logError } from "./logger.mjs";

const logger = getNamespaceLogger("api:authMiddleware");

export function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    logError(logger, "Access token is missing", req);
    return res.status(401).json({ message: "Access token is required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      logError(logger, `Token verification failed: ${err.message}`, req);
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: "Access token has expired" });
      }
      return res.status(403).json({ message: "Invalid access token" });
    }

    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  });
}

export function extractEmailFromToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7, authHeader.length);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userEmail = decoded.email;
      req.id = decoded.id;
    } catch (error) {
      logError(logger, `Invalid token: ${error.message}`, req, error);
      return res.status(401).json({ error: "Invalid token" });
    }
  } else {
    logError(logger, "Authorization header missing or invalid", req);
    return res
      .status(401)
      .json({ error: "Authorization header missing or invalid" });
  }
  next();
}
