export interface Server {
    host: string,
    port: string
}

export interface Player {
    ping: string,
    score: string,
    name: string,
    isBot: boolean
}

export interface Status {
    statusCode: number, 
    statusDesc: string
}

export interface ServerResponse {
    [key: string]: string | number | Server | Player[] | Status,
    address: Server,
    players: Player[],
    status: { statusCode: number, statusDesc: string }
}