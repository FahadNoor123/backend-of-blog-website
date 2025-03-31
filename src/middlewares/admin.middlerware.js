import jwt from "jsonwebtoken";

export const adminMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // Verify token
    if (decoded.role !== "admin") {  // Ensure it's an admin user
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    req.user = decoded; // Store user info
    next(); // Proceed to next middleware
  } catch (error) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
