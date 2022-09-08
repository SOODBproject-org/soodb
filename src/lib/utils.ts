import type { Document } from 'atlas-data-api'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function removeUndefined(obj: Record<string, any>) {
    return Object.fromEntries(Object.entries(obj).filter((x) => x[1] !== undefined))
}

export function removePrivateFields<T extends Document = Document>(doc: T): Omit<T, 'hashed_password' | 'identifier_token'> {
    return {
        ...Object.fromEntries(
            Object.entries(doc)
            .filter(x => ![ "hashed_password", "identifier_token" ].includes(x[0]))
        )
    } as Omit<T, 'hashed_password' | 'identifier_token'>
}