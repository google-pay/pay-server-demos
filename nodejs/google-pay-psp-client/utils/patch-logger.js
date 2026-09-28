const winston = require('winston');
const { format } = require('winston');
const { combine, timestamp, label, printf } = format;
require('winston-daily-rotate-file');

const loggingFormat = printf(({ level, message, label, timestamp }) => {
  return `[${timestamp}] [${level.toUpperCase()}] [${label}] : ${message}`;
});

function getLogger(merchantConfig, loggerCategory = 'UnknownCategoryLogger') {
  var appTransports = createTransportFromConfig(merchantConfig);

  var loggingLevel = merchantConfig.getLoggingLevel();
  var enableLog = merchantConfig.getEnableLog();
  return winston.loggers.get(loggerCategory, {
    level: loggingLevel,
    silent: !enableLog,
    format: combine(label({ label: loggerCategory }), timestamp(), loggingFormat),
    transports: appTransports,
  });
}

function createTransportFromConfig(mConfig) {
  var transports = [];

  var loggingLevel = mConfig.getLoggingLevel();
  var maxLogFiles = mConfig.getMaxLogFiles();
  var logFileName = mConfig.getLogFileName();
  var logDirectory = mConfig.getLogDirectory();
  var enableLog = mConfig.getEnableLog();

  transports.push(
    enableLog
      ? new winston.transports.DailyRotateFile({
          level: loggingLevel,
          filename: logFileName + '-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          dirname: logDirectory,
          maxFiles: maxLogFiles,
          silent: !enableLog,
        })
      : new winston.transports.Console({
          format: winston.format.simple({}),
        }),
  );

  return transports;
}

module.exports.getLogger = getLogger;
