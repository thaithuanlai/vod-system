const morgan = require('morgan');




const customFormat = '[:date[iso]] :method :url :status :response-time ms - :res[content-length]b';



const logger = morgan(
  process.env.NODE_ENV === 'production' ? 'combined' : customFormat
);

module.exports = logger;