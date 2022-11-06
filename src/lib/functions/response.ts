export function redirect(location: string) {
    return new Response(null, {
        headers: {
            Location: location,
        },
        status: 302,
    })
}

export function error(status: number, message: string) {
    return new Response(JSON.stringify({
        message,
    }), {
        status,
    })
}