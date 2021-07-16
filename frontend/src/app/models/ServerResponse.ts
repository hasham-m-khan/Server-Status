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

export interface ServerMessage {
    [key: string]: string | number | Server | Player[] | Status,
    address: Server,
    players: Player[],
    status: Status,
    totalBots: number,
    totalPlayers: number
}

export enum Protocol {
    "JO - 1.02" = 15,
    "JO - 1.04" = 16,
    "JA - 1.00" = 25,
    "JA - 1.01" = 26
}

export enum JO_Gametype {
    "Free For All" = 0,
    "Holocron FFA" = 1,
    "Jedi Master" = 2,
    "Duel" = 3,
    "Power Duel" = 4,
    "Team Free For All " = 5,
    "Team Free For All" = 6,
    "Capture The Yasalimari" = 7,
    "Capture The Flag" = 8,
    "Warzone" = 11
}

export enum JA_Gametype {
    "Free For All" = 0,
    "Holocron FFA" = 1,
    "Jedi Master" = 2,
    "Duel" = 3,
    "Power Duel" = 4,
    "Team Free For All " = 5,
    "Team Free For All" = 6,
    "Siege" = 7,
    "Capture The Flag" = 8,
    "Warzone" = 11
}

export const Filters = [
    "name",
    "address",
    "map",
    "players",
    "bots",
    "max clients",
    "mod",
    "gametype",
    "game"
]