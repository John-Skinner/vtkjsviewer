const Koa = require('koa');
const serve = require('koa-static');
const Router = require('../routes/routeController');
const bodyParser = require('koa-bodyparser');
const path=require('path');
const app = new Koa();
const uiPath=path.join(__dirname,'/../../../dist/image-labeler/browser');
console.log(`dirname:${__dirname} static path:${uiPath}`);
app.use(serve(uiPath));

app.use(async (ctx,next)=>{
  try {
    await next();
  } catch (error) {
    console.error(`Error in server:${error}`);
    console.error(`${error}`)
    ctx.status = error.statusCode || error.status;
    error.status = ctx.status;
    ctx.body = { error };
 //   ctx.app.emit('error',error,ctx);
  }
});
// app.use(bodyParser);
app.use(Router.routes());
app.use(Router.allowedMethods());
//app.on('error',console.error);
console.log('app initialized');
app.listen(3000);

