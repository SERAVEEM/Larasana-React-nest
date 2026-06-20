/**
 * Reads a required environment variable. Throws synchronously if it is
 * missing or empty, so the app refuses to boot rather than silently
 * falling back to an insecure default.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Set it in your .env file — see .env.example. Refusing to start with an insecure default.`,
    );
  }
  return value;
}

/**
 * Like requireEnv, but also enforces a minimum length.
 * Use this for secrets (JWT keys, API signing keys, etc.)
 * where a short/weak value is as dangerous as a missing one.
 */
export function requireSecret(name: string, minLength = 32): string {
  const value = requireEnv(name);
  if (value.length < minLength) {
    throw new Error(
      `Environment variable ${name} must be at least ${minLength} characters long. ` +
      `A short secret is as dangerous as a missing one.`,
    );
  }
  return value;
}
