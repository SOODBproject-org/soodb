export function splitIntoPages<T>(arr: T[], perPage = 24, startPage = 1): Record<number, T[]> {
    const result: Record<number, T[]> = {}
    for (let i = startPage; i < startPage + Math.ceil(arr.length / perPage); i++) {
        result[i] = arr.slice((i - 1) * perPage, Math.min(i * perPage, arr.length))
    }
    return result
}