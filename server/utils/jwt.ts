import jwt from "jsonwebtoken";

const DEFAULT_SECRET = "default_ecommerce_mvp_key_secret_code_987654321";

function getSecret(): string {
  return process.env.JWT_SECRET || DEFAULT_SECRET;
}

/**
 * Generates a standard HS256 JWT Signed Token that expires in 7 days
 */
export function generateToken(userId: string): string {
  try {
    return jwt.sign({ id: userId }, getSecret(), { expiresIn: "7d" });
  } catch (error) {
    console.error("Error signing JWT:", error);
    throw error;
  }
}

/**
 * Verifies a given token and extracts payload parameters
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, getSecret());
  } catch (error) {
    return null;
  }
}
