'use strict';
const SLSLogger = require('./lib/sls');

module.exports = function(config) {
  return async (ctx, next) => {
    const prop = config.customLoggerName || 'slsLogger';
    Object.defineProperty(ctx, prop, {
      get() {
        return new SLSLogger(ctx, config);
      }
    });
    await next();
  };
};
