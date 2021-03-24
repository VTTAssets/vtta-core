// Log levels
const LOG_LEVEL_DEBUG = 0;
const LOG_LEVEL_INFO = 1;
const LOG_LEVEL_WARN = 2;
const LOG_LEVEL_ERROR = 3;
const LOG_LEVEL_OFF = 4;

// Log formatting
const LOG_FORMATS = new Map([
  [
    LOG_LEVEL_DEBUG,
    "font-weight: bold; color: #101010; background-color: #f3f3f3;",
  ],
  [
    LOG_LEVEL_INFO,
    "font-weight: bold; background-color: lightblue; color: ##1f1f1f;",
  ],
  [
    LOG_LEVEL_WARN,
    "font-weight: bold; color: #7d8006; background-color: #f1f3a1;",
  ],
  [
    LOG_LEVEL_ERROR,
    "font-weight: bold; color: #fbefef; background-color: #9c0a0a;",
  ],
]);

// Log level prefix
const LOG_PREFIX = new Map([
  [LOG_LEVEL_DEBUG, "DEBUG"],
  [LOG_LEVEL_INFO, "INFO"],
  [LOG_LEVEL_WARN, "WARNING"],
  [LOG_LEVEL_ERROR, "ERROR"],
]);

const LOG_FUNCTIONS = new Map([
  [LOG_LEVEL_DEBUG, console.log],
  [LOG_LEVEL_INFO, console.info],
  [LOG_LEVEL_WARN, console.warn],
  [LOG_LEVEL_ERROR, console.error],
]);

/**
 * Displays the color-coded log message into the console log
 * @param module Name of the originating module
 * @param logLevel Log level for this message
 * @param data Data to display, split into a [title, ...rest]
 */
const log = (module, logLevel, data) => {
  if (filter(module, logLevel)) return;
  if (!Array.isArray(data)) data = [data];
  const [head, ...rest] = data;
  const coloredTitle = `%c[${LOG_PREFIX.get(logLevel)}] ${module}: %c${head}`;
  LOG_FUNCTIONS.get(logLevel)(
    coloredTitle,
    LOG_FORMATS.get(logLevel),
    LOG_FORMATS.get(logLevel) + ";font-weight: normal"
  );
  if (rest.length > 0) {
    LOG_FUNCTIONS.get(logLevel)(...rest);
  }
};

/**
 * Filters all log messages that are below the configured module threshold
 * @param module Name of the originating module
 * @param logLevel Log level for this message
 */
const filter = (module, logLevel) => {
  let configuredLogLevel;
  try {
    configuredLogLevel = game.settings.get(module, "logLevel");
  } catch (error) {
    configuredLogLevel = LOG_LEVEL_OFF;
  }
  return logLevel < configuredLogLevel;
};

/**
 * Construct the global object
 */
const vtta = {
  logger: {
    debug: (module, data) => log(module, LOG_LEVEL_DEBUG, data),
    info: (module, data) => log(module, LOG_LEVEL_INFO, data),
    warn: (module, data) => log(module, LOG_LEVEL_WARN, data),
    error: (module, data) => log(module, LOG_LEVEL_ERROR, data),
  },
};

/**
 * Assign the global object or expand it at least
 */
export default function () {
  if (window.vtta) {
    window.vtta = Object.assign(window.vtta, vtta);
  } else {
    window.vtta = vtta;
  }
}
