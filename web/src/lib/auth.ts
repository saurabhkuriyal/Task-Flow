import { SignJWT, jwtVerify } from "jose"
const secret = new TextEncoder().encode(process.env.secret_key);
const issuer = "urn:ai:taskmanager"

export async function signInToken(payload: any) {
    console.log("reacher here for token generation");

    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(secret);
}