/** Keep in sync everywhere tokens are signed or verified (Node API + Edge proxy). */
export const JWT_SECRET_DEFAULT = 'your-secret-key-change-in-production'

export function getJwtSecretString(): string {
  return process.env.JWT_SECRET || JWT_SECRET_DEFAULT
}
