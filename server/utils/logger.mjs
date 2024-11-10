import { createLogger, format, transports } from 'winston';

const { combine, label, printf, colorize } = format;

// Remove `timestamp()` from the format combination
export const getNamespaceLogger = (namespace) => {
    return createLogger({
        format: combine(
            colorize(),
            label({ label: namespace }),
            printf(({ level, message, label, username }) => {
                const userInfo = username ? `(${username})` : '';
                return `[${label}] ${userInfo} ${level}: ${message}`;
            })
        ),
        transports: [new transports.Console()],
    });
};

// Log info-level messages with optional `username` using a predefined logger
export const logInfo = (logger, message, req = null) => {
    const username = req?.user?.username || null;
    logger.info(message, { username });
};

export const logError = (logger, message, req = undefined, error = undefined) => {
    const username = req?.user?.username || null;
    const errorMessage = error instanceof Error ? error.stack || error.message : error;
    logger.error(`${message}${errorMessage ? ` - ${errorMessage}` : ''}`, { username });
};



