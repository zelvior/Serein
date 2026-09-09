export function isOwner(resourceUserId: string | undefined, requestUserId: string): boolean {
  return !!resourceUserId && resourceUserId === requestUserId;
}
