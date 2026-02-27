// packages/shared/src/types/jwt-payload.ts
export interface JwtPayload {
  sub: string;      // user id
  tenantId: string; // tenant id for multi-tenancy
}