/**
 * Securely hashes a string (like an MPIN or password) using SHA-256.
 * Returns the hex representation of the hash.
 */
export async function hashMpin(mpin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(mpin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
