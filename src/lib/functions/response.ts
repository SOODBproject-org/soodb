export function redirect(location: string) {
    return {
        headers: {
            Location: location,
        },
        status: 302,
    }
}

export function error(status: number, message: string) {
    return {
        status,
        body: {
            message
        }
    }
}

export type MaybeError<T> = T | { message: string }