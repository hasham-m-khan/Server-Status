import { format, createLogger, transports } from 'winston';
const { combine, timestamp, errors, json } = format;


export function prodLogger() {
    
    return createLogger({
            format: combine(
                timestamp(), 
                errors({stack: true}),
                json()
            ),
            defaultMeta: { service: 'user-service'},
            transports: [
                new transports.Console()
            ]
    });

}