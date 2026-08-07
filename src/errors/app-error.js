import { ERROR_CODES } from "./error-codes.js";
import { errorsDictionary } from "./error.dictionary.js";

export class AppError extends Error {
    constructor(code, customMessage, details) {
        const errorDefinition = errorsDictionary[code] ?? errorsDictionary[ERROR_CODES.INTERNAL_SERVER_ERROR];
        const resolvedMessage = errorsDictionary[code] ? code : 'INTERNAL_SERVER_ERROR';

        super(customMessage ?? errorDefinition.message);

        this.code = resolvedMessage;
        this.statusCode = errorDefinition.statusCode;
        this.details = details || null;
        this.message = customMessage ?? errorDefinition.message;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;