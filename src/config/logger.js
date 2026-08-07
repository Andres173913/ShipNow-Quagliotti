import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

import { config } from '../config/config.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logDir = path.join(__dirname, '../../logs');

const customLevel = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colors: {
        fatal: 'red bold',
        error: 'red',
        warn: 'yellow',
        info: 'blue',
        http: 'magenta',
        debug: 'green'
    }
};

winston.addColors(customLevel.colors);

const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf((({ timestamp, level, message, stack }) => {
        return `${timestamp} [${level}]: ${stack ?? message}`;
    }))
);

const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
);

const logger = winston.createLogger({
    levels: customLevel.levels,
    level: config.env === 'production' ? 'info' : 'debug',
    transports: [
        // 1. Salida por consola
        new winston.transports.Console({ format: consoleFormat }),

        // 2. Archivo rotativo exclusivo para errores
        new DailyRotateFile({
            dirname: logDir,
            filename: 'error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            format: fileFormat,
            maxFiles: '14d',
        }),

        // 3. Archivo rotativo exclusivo para fatales
        new DailyRotateFile({
            dirname: logDir,
            filename: 'fatal-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'fatal',
            format: fileFormat,
            maxFiles: '14d',
        }),

        // 4. Archivo combinado (captura desde 'info' o 'debug' hacia abajo según tu nivel global)
        new DailyRotateFile({
            dirname: logDir,
            filename: 'combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            format: fileFormat,
            maxFiles: '14d',
        })
    ]
});

export default logger;