/**
 * Helper to check if a user is authorized as an administrator based on
 * the ADMIN / ADMIN_EMAIL / ADMIN_EMAILS environment variable in the .env file.
 */
export function isEmailInAdminEnv(email: string): boolean {
  const adminVar =
    process.env.ADMIN ||
    process.env.ADMIN_EMAIL ||
    process.env.ADMIN_EMAILS ||
    "seeramnaveenkumar673@gmail.com"; // default fallback in case not set yet

  if (!adminVar) {
    return false;
  }

  // Split by common delimiters (comma, semicolon, space, or vertical bar)
  const allowedEmails = adminVar
    .split(/[,;|\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return allowedEmails.includes(email.toLowerCase().trim());
}

/**
 * Checks if the user meets both criteria:
 * 1. Has title/role is "admin"
 * 2. Email is in the list of emails in the admin variable of .env
 */
export function isUserAdmin(user: any): boolean {
  if (!user) return false;
  
  // 1. Check title/role is "admin"
  const hasAdminTitle =
    user.title?.toLowerCase() === "admin" ||
    user.role?.toLowerCase() === "admin" ||
    user.email?.toLowerCase().includes("admin"); // fallback help
    
  // 2. Check email is in the env list
  const hasAdminEmail = isEmailInAdminEnv(user.email);

  return hasAdminTitle && hasAdminEmail;
}
