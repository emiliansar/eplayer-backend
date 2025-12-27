export interface AuthJwtPayload {
    sub: number,
    email?: string,
    name?: string,
    iat?: number,
    exp?: number,
}