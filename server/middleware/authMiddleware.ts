import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { User } from "../models/User";
import { isEmailInAdminEnv } from "../utils/adminCheck";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const name = parts[0].trim();
    if (name) {
      cookies[name] = parts.slice(1).join("=").trim();
    }
  });
  return cookies;
}

/**
 * Protects routes from unauthenticated users using Bearer token verification or Cookie sessions
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
    token = req.headers.authorization.split(" ")[1];
  } else if (req.headers.cookie) {
    const cookies = parseCookies(req.headers.cookie);
    token = cookies["token"];
  }

  if (token) {
    try {
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

  // Allow access if the user has either the "admin" title/role or their email is whitelisted in the .env file.
  if (!hasAdminTitle && !hasAdminEmail) {
    res.status(403).json({
      message: "Access denied. Your profile title must be 'admin' or your email must be in the .env admin access configuration list.",
    });
    return;
  }

  next();
}
