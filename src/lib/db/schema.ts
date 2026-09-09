export const COLLECTIONS = {
  profiles: "profiles",
  conversations: "conversations",
  messages: "messages", // subcollection under conversations
  memories: "memories",
  providers: "connected_providers",
  usage: "usage_limits",
} as const;

// Email/password accounts are stored in Firebase Auth directly (not Firestore).
// conversations/{id}: { userId, title, createdAt, updatedAt }
// conversations/{id}/messages/{id}: { role, content, createdAt }
// profiles/{userId}: UserProfile
// memories/{id}: MemoryItem
// connected_providers/{userId}_{provider}: { userId, provider, encryptedKey, createdAt }
// usage_limits/{userId}_{date}: { userId, date, requestCount, tokenCount }
