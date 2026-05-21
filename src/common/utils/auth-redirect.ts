export function normalizeAuthRedirectPath(value: unknown) {
  if (typeof value !== 'string') {
    return '/';
  }

  if (!value.startsWith('/') || value.startsWith('//')) {
    return '/';
  }

  return value;
}
