import express from "express";

const loggerRouter = express.Router();

loggerRouter.get('/debug', (req, res) => {
  req.logger.debug('Debug level log');
  res.send('Debug log generated');
});

loggerRouter.get('/info', (req, res) => {
  req.logger.info('Info level log');
  res.send('Info log generated');
});

loggerRouter.get('/warn', (req, res) => {
  req.logger.warn('Warn level log');
  res.send('Warn log generated');
});

loggerRouter.get('/error', (req, res) => {
  req.logger.error('Error level log');
  res.send('Error log generated');
}); 

loggerRouter.get('/fatal', (req, res) => {
  req.logger.fatal('Fatal level log');
  res.send('Fatal log generated');
});

export default loggerRouter;