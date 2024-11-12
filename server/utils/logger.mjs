import { createLogger, format, transports } from 'winston';

const { combine, label, printf, colorize } = format;

// Configure the logger format
export const getNamespaceLogger = (namespace) => {
    return createLogger({
        format: combine(
            colorize(),
            label({ label: namespace }),
            printf(({ level, message, label, username }) => {
                const userInfo = username ? `(${username})` : '';
                return `[${label}] ${userInfo.trim()} ${level}: ${message.trim()}`; // Trim to avoid line breaks and extra spaces
            })
        ),
        transports: [new transports.Console()],
    });
};

// Log info-level messages with optional `username` using a predefined logger
export const logInfo = (logger, message, req = null) => {
    const username = req?.user?.username?.trim() || null; // Ensure username is trimmed
    logger.info(message.trim(), { username }); // Ensure message is trimmed
};

export const logError = (logger, message, req = undefined, error = undefined) => {
    const username = req?.user?.username || null;
    const errorMessage = error instanceof Error ? error.stack || error.message : error;
    logger.error(`${message}${errorMessage ? ` - ${errorMessage}` : ''}`, { username });
};



