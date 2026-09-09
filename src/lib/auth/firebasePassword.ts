interface SignInResult {
  localId: string;
  email: string;
}

function apiKey(): string {
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!key) throw new Error("firebase_api_key_missing");
  return key;
}

/**
 * Verifies email/password against Firebase Auth. The Admin SDK cannot check
 * passwords directly, so this calls the Identity Toolkit REST API — the same
 * endpoint the Firebase client SDK uses under the hood for signInWithPassword.
 */
export async function verifyFirebasePassword(email: string, password: string): Promise<SignInResult | null> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: false }),
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return { localId: data.localId, email: data.email };
}
