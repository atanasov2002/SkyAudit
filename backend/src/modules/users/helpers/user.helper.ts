export function isAccountLocked(user: any): boolean {
  return (
    user.accountLockedUntil !== null && user.accountLockedUntil > new Date()
  );
}
export function isEmailVerificationExpired(user: any): boolean {
  return (
    user.emailVerificationTokenExpires !== null &&
    user.emailVerificationTokenExpires < new Date()
  );
}
export function isPasswordResetExpired(user: any): boolean {
  return (
    user.passwordResetTokenExpires !== null &&
    user.passwordResetTokenExpires < new Date()
  );
}
export function isRefreshTokenValid(token: any): boolean {
  return token.isRevoked === false && token.expiresAt > new Date();
}
