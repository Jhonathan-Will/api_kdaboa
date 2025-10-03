// backend/api_kdaboa/api/src/common/base-url.util.ts
export function getBaseUrl(): string {
  return process.env.BASE_URL || 'http://localhost:3000';
}
