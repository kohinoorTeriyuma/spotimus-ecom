import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { User } from "../models/User";
import { isEmailInAdminEnv } from "../utils/adminCheck";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * Protects routes from unauthenticated users using Bearer token verification
 */
export async function protect(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from Bearer <Token>
      token = req.headers.authorization.split(" ")[1];

      // Decode validation
      const decoded = verifyToken(token);

      if (!decoded || !decoded.id) {
        res.status(401).json({ message: "Not authorized: Invalid token." });
        return;
      }

      // Find user
      const user = await User.findById(decoded.id);

      if (!user) {
        res
          .status(401)
          .json({ message: "Not authorized: User no longer exists." });
        return;
      }

      // Attach user to Request payload
      // Remove password for security
      const { password, ...safeUser } = user;
      req.user = safeUser;

      next();
    } catch (error) {
      console.error("Auth protect middleware error:", error);
      res.status(401).json({ message: "Not authorized: Token check failed." });
    }
  } else {
    res.status(401).json({ message: "Not authorized: No token found." });
  }
}

/**
 * Restricts access to Admin-only users based on title and admin list from .env
 */
export function adminProtect(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ message: "Not authorized: No user profile context loaded." });
    return;
  }

  const hasAdminTitle = req.user.title?.toLowerCase() === "admin";
  const hasAdminEmail = isEmailInAdminEnv(req.user.email);

  // Combine both checks as requested: "add a feature to add products when the title is admin.
  // for now take the emails given in the admin variable in the .env file and give access to those emails only."
  if (!hasAdminTitle) {
    res.status(403).json({
      message: "Access denied. Your profile title must be set as 'admin' to proceed.",
    });
    return;
  }

  if (!hasAdminEmail) {
    res.status(403).json({
      message: `Access denied. Your email '${req.user.email}' is not permitted in the .env admin access configuration list.`,
    });
    return;
  }

  next();
}
