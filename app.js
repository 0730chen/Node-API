const koa = require("koa");
const app = new koa();
const Router = require("koa-router");
const superagent = require("superagent");
const cheerio = require("cheerio");
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


//使用异步 
router.get("/", async ctx => {
  let url = "https://www.zhihu.com/";
  let srcTitle = await getData(url); //获得html文本
  let indexResult = await DataAnalysis(srcTitle);
  ctx.body = await getData2(indexResult)

  //解析首页html文本
  //   let warp = htmlAnalysis(result.src)
  //  ctx.body = await new Promise((resolve, reject) => {
  //    let htmlResult = []
  //    indexResult.src.filter((e)=>{
  //    //过滤专栏网址
  //    if(!e.includes('zhuanlan')){
  //      return e
  //    }
  //  }).forEach(async (e,i) => {
  //    console.log(e,i)
  //    let html = await getData(e)//成功请求到html页面
  //    htmlResult = await htmlAnalysis(html)
  //  })
  // resolve(htmlResult)
  // })

  //1.indexResult是一个对象。对象的src是一个获得全部url属性
  //2.定义一个函数，接受一个
  //过滤后的链接
});

//定义获取数据函数 纯HTML文本 //传入一个url，获得返回的文本信息
let getData = function(url) {
  return new Promise((resolve, reject) => {
    superagent
      .get(url)
      .set({
        Connection: "keep-alive",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36",
        cookie:
          '_xsrf=jK29u4eQvBfhy7a8E84Tb9v8AoXFYu6i; _zap=9420a2ed-6673-4542-93a0-5b3cb3d7845d; d_c0="AKAjBCA56w2PTvkVrSO6XiGtCGwmoc7QjMs=|1531903857"; __gads=ID=9166dd567e309628:T=1546853213:S=ALNI_Mbdto8xi5qFbZAT79xY5dg-ze4xnA; __utmc=51854390; __utmv=51854390.100--|2=registration_date=20170904=1^3=entry_date=20170904=1; __utmz=51854390.1562828657.7.6.utmcsr=cn.bing.com|utmccn=(referral)|utmcmd=referral|utmcct=/; __utma=51854390.224633120.1537528699.1562828657.1562828657.8; tst=r; l_n_c=1; l_cap_id="ODM3NjNkNzcyMDYwNDI5MDk3NDU5MmJiMjFhNGVhYTQ=|1570602205|efd74e90bee34399b8a2a0b2634c0ea631262f55"; r_cap_id="ODMyNGFiZWJmZDRjNDBkMDk0ZDViYzZhMzg3Yjk0ZTM=|1570602205|fdffccbacd82b69374c24b77e07c7222fe69bb4a"; cap_id="Nzg1NGZjZWMyZWZhNGQxZjk4OGNiZDEzNTFlMWRmMGM=|1570602205|aff072c242fa668dcfd66cbf2eac82e1c5aaa866"; n_c=1; Hm_lvt_98beee57fd2ef70ccdd5ca52b9740c49=1571637964,1571637973,1571644392,1571707597; capsion_ticket="2|1:0|10:1571707597|14:capsion_ticket|44:NDczNGU3MWRlNjJiNDU4MjlmMzk5N2E2OTRhZTcyYjM=|1be0762519c170b5595fd27d9fcf12ad044449af116e2bdc93892e3eca641f27"; z_c0="2|1:0|10:1571707697|4:z_c0|92:Mi4xdGRiY0JRQUFBQUFBb0NNRUlEbnJEU2NBQUFDRUFsVk5NZWpWWFFDYjFSeV9UanFPWDVOd2xtYjltR0pHVkNJSEN3|b1956e3e29ed4b5edbe56e7a2d351a51056feada15e0a7eb31adee42880de999"; q_c1=b2573ca1a2134ace9ffc7113516b6761|1571708014000|1571708014000; tgw_l7_route=060f637cd101836814f6c53316f73463; Hm_lpvt_98beee57fd2ef70ccdd5ca52b9740c49=1571710979',
        "content-type": "application/json"
      })
      .end((err, res) => {
        if (err) {
          console.log(err);
        }
        resolve(res.text);
      });
  });
};
// 传入HTML文本信息，然后获得需要的信息
let DataAnalysis = function(data) {
  return new Promise((resolve, reject) => {
    let question = {
      src: [],
      title: []
    };
    const $ = cheerio.load(data);
    let a = $(".ContentItem-title a").each((i, e) => {
      let srcAdd = `https://www.zhihu.com` + e.attribs.href.slice(0, 19); //获取所有问题下所有回答的的网址,过滤链接
      question.src.push(srcAdd);
      question.title.push(e.children[0].data);
    });
    //过滤链接
    question.src.filter(e => {
      if (!e.includes("zhuanlan")) return e;
    });
    resolve(question);
  });
};
// //传入获得网页的数据数组
let htmlAnalysis = function(html) {
  return new Promise((resolve, reject) => {
    let wrap = []; //数组
    let $ = cheerio.load(html);
    let author = $(".UserLink-link").text(); //作者名字
    let status = $(".ztext AuthorInfo-badgeText").text(); //状态
    let htmlData = $(".RichContent-inner").text(); //文章内容

    let wrapContent = {
      author: author,
      status: status,
      comments: htmlData
    };
    wrap.push(wrapContent);

    resolve(wrap);
  });
};
//传入一个对象，对象有src属性，src属性是一个数组，数组包含url 在对url进行请求操作，最后返回
let getData2 = function(indexResult) {
  return new Promise(async (resolve, reject) => {
    let Result = [];
    for (let i = 0; i < indexResult.src.length; i++) {
      let html = await getData(indexResult.src[i]); //成功请求到html页面
      let htmlResult = await htmlAnalysis(html);
      Result.push(htmlResult)
    }
    resolve(Result);
  });
};

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(8000);
