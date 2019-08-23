declare module 'koa-logger-sls' {
  interface SLSConfig {
    topic: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint: string;
    project: string;
    logStore: string;
    apiVersion?: string;
    flushInterval?: number;
    maxBufferLength?: number;
    apiVersion?: string;
    eol?: string;
    encoding?: string;
    env?: string[];
  }
  class SLSLogger {
    constructor(ctx: any, config: SLSConfig);
    error(msg: any, ...args: any[]): void;
    warn(msg: any, ...args: any[]): void;
    info(msg: any, ...args: any[]): void;
    debug(msg: any, ...args: any[]): void;
  }

  export default function middleware(config: SLSConfig): (ctx: any, next: any) => void;
}
