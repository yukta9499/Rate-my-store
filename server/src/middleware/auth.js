import jwt from "jsonwebtoken";

/**
 * ✅ Basic login required
 */
export function authRequired(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/**
 * ✅ Allow only specific roles (array)
 * Example: requireRoles(["ADMIN","OWNER"])
 */
export function requireRoles(roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: Insufficient role" });
    }
    next();
  };
}

/**
 * ✅ Alias for backward compatibility (single role)
 * Example: requireRole("ADMIN")
 */
export const requireRole = (role) => requireRoles([role]);
