const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function sitePath(value = '') {
  if (!basePath || !value.startsWith('/') || value.startsWith('//')) return value;
  if (value === basePath || value.startsWith(`${basePath}/`) || value.startsWith(`${basePath}#`) || value.startsWith(`${basePath}?`)) return value;
  return `${basePath}${value === '/' ? '' : value}`;
}
