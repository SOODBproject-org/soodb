// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function removeUndefined(obj: Record<string, any>) {
    return Object.fromEntries(Object.entries(obj).filter((x) => x[1] !== undefined))
}
