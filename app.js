const koa = require("koa");
const app = new koa();
const Router = require("koa-router");
const superagent = require("superagent");
const cheerio = require('cheerio')
let router = new Router();
//原生参数是使用 ctx.request.url 获取来判断 ctx是一个对象，包含了请求的所有信息
// app.use(async (ctx,next)=>{
// 	await next()
// 	console.log(ctx)
// 	console.log(ctx.request.url)
// 	if(ctx.request.url ==='/'){
// 		ctx.body = `首页`
// 	}else if(ctx.request.url ==='/hello'){
// 		ctx.body = `hello`
// 	}else{
// 		ctx.boyd = 'error'
// 	}
// })

//使用路由

router.get("/", async ctx => {
  let url = "https://www.douban.com/search?q=电影";
  let a = await getData(url);
  let result = DataAnalysis(a)
  console.log('我是路径中的',result)
  ctx.body = result
});

//定义获取数据函数 纯HTML文本
let getData = function(url) {
  return new Promise((resolve, reject) => {
    superagent
      .get(url)
      .set({
        Connection: "keep-alive",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36"
      })
      .end((err, res) => {
        if (err) {
          console.log(err);
        }
        resolve(res.text);
      });
  });
};
//解析获得的HTML文本
let DataAnalysis = function(data){
	let arr = []
	const $ = cheerio.load(data)
	let a = $('.nbg').each((i,e)=>{
		arr.push(e.attribs.href)
		// console.log($(e).attr('src'))
	})
	return arr

	// console.log($)
}


app.use(router.routes());
app.use(router.allowedMethods());

app.listen(8000);
