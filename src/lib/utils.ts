import type { Document } from "atlas-data-api"

export type DistributiveOmit<T, K extends keyof Record<string, unknown>> = T extends unknown ? Omit<T, K> : never

export function removeUndefined(obj: Record<string, unknown>) {
    return Object.fromEntries(Object.entries(obj).filter((x) => x[1] !== undefined))
}

export function removePrivateFields<T extends Document = Document>(
    doc: T
): Omit<T, "hashed_password" | "identifier_token"> {
    return {
        ...Object.fromEntries(
            Object.entries(doc).filter((x) => !["hashed_password", "identifier_token"].includes(x[0]))
        ),
    } as Omit<T, "hashed_password" | "identifier_token">
}

export type Rename<T, K extends keyof T, N extends string> = Pick<T, Exclude<keyof T, K>> & { [P in N]: T[K] }

export function convertId<T extends Record<string, unknown>>(doc: T | null) {
    return doc
        ? Object.fromEntries(
            Object.entries(doc).map(([k, v]) => [k === "_id" ? "id" : k, v])
        ) as Rename<T, "_id", "id">
        : null
}