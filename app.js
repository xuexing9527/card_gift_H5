var app = require('koa')(),
  logger = require('koa-logger'),
  json = require('koa-json'),
  views = require('koa-views'),
  config = require('./config/default'),
  onerror = require('koa-onerror');

var bodyParser = require('koa-bodyparser');
// var index = require('./routes/index');
var users = require('./routes/users');

const session = require('koa-session');

/**session配置 */
const sessionConfig = {
  key: 'koa:sess', // cookie key (默认koa：sess)
  maxAge: 86400000 * 30, // cookie的过期时间,毫秒，默认为1天
  overwrite: true, // 是否覆盖    (默认default true)
  httpOnly: false, // cookie是否只有服务器端可以访问, 默认为true
  signed: true, // 签名默认true
  rolling: false, // 在每次请求时强行设置cookie，这将重置cookie过期时间（默认：false）
  renew: false, // (boolean) 会话即将到期时,续订会话
};
//使用session
app.keys = ['secret'];

app.use(function *(next){
  session(sessionConfig, app)
  yield next;
});

app.use(function *(next) {
  this.set('Access-Control-Allow-Credentials', true);
  yield next;
});

// error handler
onerror(app);

// global middlewares
app.use(views('views', {
  root: __dirname + '/views',
  default: 'jade'
}));

app.use(require('koa-bodyparser')());
// 使用表单解析中间件
app.use(bodyParser());

app.use(json());
app.use(logger());

app.use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  console.log('%s %s - %s', this.method, this.url, ms);
});

app.use(require('koa-static')(__dirname + '/public'));

// routes definition
// app.use(index.routes(), index.allowedMethods());
app.use(users.routes(), users.allowedMethods());

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app;
