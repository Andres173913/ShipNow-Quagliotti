import logger from '../config/logger.js';

export const addLogger = (req, res, next) => {
    req.logger = logger;
    req.logger.http(`${req.method} is used in ${req.url} - ${new Date().toLocaleTimeString()}`);
    next();
};