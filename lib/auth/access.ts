export function getLoginRedirect(pathname: string): string {
  const safePath = pathname.startsWith("/") && !pathname.startsWith("//") ? pathname : "/dashboard";
  return `/login?callbackUrl=${encodeURIComponent(safePath)}`;
}

export function getAuthenticationDecision(userId: string | null | undefined, pathname: string) {
  return userId ? { allowed: true as const } : { allowed: false as const, redirectTo: getLoginRedirect(pathname) };
}
