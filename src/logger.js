// logger.js
import Debug from 'debug';

export function createDebugger(namespace) {
  const debug = Debug(namespace);
  return function (message, ...args) {
    debug(message, ...args);
    // Add a check to ensure console logs are only written in development mode
    if (process.env.NODE_ENV === 'development') {
      // console.log(message, ...args);
    }
  };
}
