#KOA-LOGGER-SLS

koa 的阿里云日志服务中间件

## 安装

```
$ npm i koa-logger-sls
```

## 配置 KOA 中间价

```
const logger from 'koa-logger-sls';
const app = new Koa();

const config = {
  customLoggerName: '自定义log调用名称,默认slsLogger'
  flushInterval: 1000,
  maxBufferLength: 1000,
  topic: 'your-topic-name',
  accessKeyId: '在阿里云sls申请的 accessKeyId',
  secretAccessKey: '在阿里云sls申请的 secretAccessKey',
  // 根据你的 sls project所在地区选择填入
  // 北京：http://cn-beijing.sls.aliyuncs.com
  // 杭州：http://cn-hangzhou.sls.aliyuncs.com
  // 青岛：http://cn-qingdao.sls.aliyuncs.com
  // 深圳：http://cn-shenzhen.sls.aliyuncs.com

  // 注意：如果你是在 ECS 上连接 SLS，可以使用内网地址，速度快，没有带宽限制。
  // 北京：cn-hangzhou-intranet.sls.aliyuncs.com
  // 杭州：cn-beijing-intranet.sls.aliyuncs.com
  // 青岛：cn-qingdao-intranet.sls.aliyuncs.com
  // 深圳：cn-shenzhen-intranet.sls.aliyuncs.com
  endpoint: 'your-endpoint',
  //目前支持最新的 api 版本, 不需要修改
  apiVersion: '2015-06-01',
  project: 'your-project-name',
  logStore: 'your-logStore-name'
}

app.use(logger(config));

```

## 打印日志

在任何可以拿到 ctx 的地方,使用 ctx.slsLogger 或者 ctx.customLoggerName

```
ctx.slsLogger.debug(anyMsg)
ctx.slsLogger.info(anyMsg)
ctx.slsLogger.warn(anyMsg)
ctx.slsLogger.error(anyMsg)
```

## License

[MIT]("https://github.com/eggjs/egg-logger/blob/master/LICENSE")
