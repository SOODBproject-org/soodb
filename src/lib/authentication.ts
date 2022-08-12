import fs from "fs"
import jwt from "jsonwebtoken"
import { getUserByID } from "./mongo"

const privateKey = fs.readFileSync("jwt.key")

export function generateToken(userID: string, time: number | string = "6h") {
    return jwt.sign({ userID }, privateKey, {
        algorithm: "RS256",
        expiresIn: time,
    })
}

export async function getIDFromToken(token: string) {
    try {
        const tokenPayload = jwt.verify(token, privateKey, {
            algorithms: ["RS256"],
        }) as jwt.JwtPayload & { userID: string }
        return tokenPayload.userID
    } catch (e) {
        return null
    }
}

export async function getUserFromToken(token: string) {
    try {
        const tokenPayload = <jwt.JwtPayload>jwt.verify(token, privateKey, { algorithms: ["RS256"] })
        const userData = await getUserByID(tokenPayload.userID)
        return userData || null
    } catch (e) {
        return null
    }
}
