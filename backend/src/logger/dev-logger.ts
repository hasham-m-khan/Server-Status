import { format, createLogger, transports } from 'winston';
const { printf, combine, timestamp, colorize, errors } = format;


export function devLogger() {
    
    const logFormat = printf(({ level, message, stack, timestamp }) => {
        return `${timestamp} ${level}: ${stack || message}`;
    });

    return createLogger({
        format: combine(
            colorize(), 
            timestamp({ format: '<YYYY-MM_DD HH:mm:ss>' }), 
            logFormat, 
            errors({stack: true})
        ),
        transports: [
            new transports.Console()
        ]
    });

}



export function log (data: any): void {
    console.log(data);
}