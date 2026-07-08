




import winston from 'winston';

const { combine, timestamp, colorize, printf, errors, json } = winston.format;


const consoleFormat = combine(
  colorize(),
  printf(({ timestamp, level, message, service, ...meta }) => {
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] [${service}]: ${message}${extra}`;
  })
);


const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'processing-service' },
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
  ],
});

export default logger;
