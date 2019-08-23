'use strict';

const ALY = require('aliyun-sdk');
const os = require('os');
const util = require('util');
const assert = require('assert');

class SLSLogger {
  constructor(ctx, config) {
    this._bufSize = 0;
    this._buf = [];
    this._timer = this._createInterval();
    this._client = null;
    this.ctx = ctx;
    this._config = config;
    assert(this.config.topic, 'should pass config.sls.topic');
    assert(this.config.accessKeyId, 'should pass config.sls.accessKeyId');
    assert(this.config.secretAccessKey, 'should pass config.sls.secretAccessKey');
    assert(this.config.endpoint, 'should pass config.sls.endpoint');
    assert(this.config.project, 'should pass config.sls.project');
    assert(this.config.logStore, 'should pass config.sls.logStore');
  }

  get client() {
    if (!this._client) {
      this._client = new ALY.SLS({
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
        endpoint: this.config.endpoint,
        apiVersion: this.config.apiVersion
      });
    }
    return this._client;
  }

  get config() {
    return Object.assign(
      {
        flushInterval: 1000,
        maxBufferLength: 1000,
        eol: '#end#',
        encoding: 'utf8',
        apiVersion: '2015-06-01'
      },
      this._config
    );
  }

  _createInterval() {
    return setInterval(this.flush.bind(this), this.config.flushInterval);
  }

  _closeInterval() {
    clearInterval(this._timer);
    this._timer = null;
  }

  get validEnv() {
    const env = this.config.env;
    if (env) {
      const NODE_ENV = process.env.NODE_ENV;
      if (env instanceof Array) {
        return env.includes(NODE_ENV);
      } else {
        return env === NODE_ENV;
      }
    }
    return true;
  }

  _log(level, args, meta) {
    if (!this.validEnv) {
      return;
    }
    const format = this.config.formatter || this._format;
    const msg = JSON.stringify(format(level, args, meta)) + this.config.eol;
    const buf = Buffer.from(msg);
    if (buf.length) {
      this._write(buf);
    }
  }

  _write(buf) {
    this._bufSize += buf.length;
    this._buf.push(buf);
    if (this._buf.length > this.config.maxBufferLength) {
      this.flush();
    }
  }

  flush() {
    if (this._buf.length > 0) {
      let msg;
      if (this.config.encoding === 'utf8') {
        msg = this._buf.join('');
      } else {
        msg = Buffer.concat(this._buf, this._bufSize).toString();
      }
      this._putLogs(this._getJsonLogs(msg));
      this._buf = [];
      this._bufSize = 0;
    }
  }

  close() {
    this._closeInterval();
    super.close();
  }

  _putLogs(logs) {
    const opt = {
      projectName: this.config.project,
      logStoreName: this.config.logStore,
      logGroup: {
        logs,
        topic: this.config.topic, // optional
        source: this.hostName // optional
      }
    };
    this.client.putLogs(opt, this._putLogCb.bind(this));
  }

  _putLogCb(err) {
    if (err) {
      throw err;
    }
  }

  _format(level, args, meta) {
    let contents = [
      {
        key: 'level',
        value: level
      },
      {
        key: 'message',
        value: util.format(...args)
      }
    ];
    if (meta && meta.ctx) {
      const ctx = meta.ctx;
      contents = contents.concat([
        {
          key: 'env',
          value: ctx.app.env
        },
        {
          key: 'method',
          value: ctx.request.method
        },
        {
          key: 'url',
          value: ctx.request.url
        },
        {
          key: 'traceId',
          value: (ctx.tracer && ctx.tracer.traceId) || '-'
        },
        {
          key: 'userId',
          value: (ctx.userId && ctx.userId.toString()) || '-'
        },
        {
          key: 'x-session-id',
          value: ctx.header['x-session-id'] || '-'
        },
        {
          key: 'cookie',
          value: ctx.header.cookie || '-'
        },
        {
          key: 'request',
          value: JSON.stringify(ctx.request.body)
        },
        {
          key: 'response',
          value: JSON.stringify(ctx.request.body) || '-'
        }
      ]);
    }
    return {
      time: Math.floor(new Date().getTime() / 1000), // 单位秒
      contents
    };
  }

  _getJsonLogs(msg) {
    return msg
      .split(this.config.eol)
      .filter(msg => msg)
      .map(msg => JSON.parse(msg));
  }

  get hostName() {
    return os.hostname();
  }
}

['error', 'warn', 'info', 'debug'].forEach(level => {
  const LEVEL = level.toUpperCase();
  SLSLogger.prototype[level] = function() {
    const meta = {
      ctx: this.ctx
    };
    this._log(LEVEL, arguments, meta);
  };
});

module.exports = SLSLogger;
