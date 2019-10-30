let koa = require("koa");

let app = new koa();

const Router = require("koa-router");
const superagent = require("superagent");
const cheerio = require("cheerio");
let router = new Router();

router.get("/", async ctx => {
  let params = {
    session_token: "1d21a48fae24f574fa79e64d8893eb29", //1d21a48fae24f574fa79e64d8893eb29
    desktop: true,
    page_number: 5,
    limit: 10,
    action: "down",
    after_id: 11
  };
  //https://www.zhihu.com/api/v3/feed/topstory/recommend?session_token=b2aed9c19be2b2c2896191451e924d10&desktop=true&page_number=3&limit=6&action=down&after_id=11
  let url =
    `https://www.zhihu.com/api/v3/feed/topstory/recommend?` +
    `session_token=${params.session_token}` +
    `desktop=${params.desktop}` +
    `page_number=${params.page_number}` +
    `limit=${params.limit}` +
    `action=${params.action}` +
    `after_id=${params.after_id}`;
  let result = [];
  //使用for循环改变url数值，执行顺序  for循环执行完毕后，才会执行ctx.body
  for (let i = 0; i < 5; i++) {
    //0.1.2.3.4
    params.page_number += i;
    let response = await getData(url); //异步获取数据,url是改变的
    //能够打印出全部的数据
    console.log("---");
    result.push(response); //在外部定义一个数组，数组中添加数据
  }
  accessAllHtml(result);
  //result储存了获取的问题id
  //定义访问获得的所有的问题对应的网站的函数

  console.log(`111`);
  ctx.body = result;
  // let response = await getData(url); //获取到问题的id
});

//获得所有的问题
//1.使用数组储存对象每次push都要是一个新对象，不能是一个对象
let getData = function(url) {
  return new Promise((resolve, reject) => {
    superagent
      .get(url)
      .set({
        Connection: "keep-alive",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36",
        cookie:
          '_xsrf=jK29u4eQvBfhy7a8E84Tb9v8AoXFYu6i; _zap=9420a2ed-6673-4542-93a0-5b3cb3d7845d; d_c0="AKAjBCA56w2PTvkVrSO6XiGtCGwmoc7QjMs=|1531903857"; __gads=ID=9166dd567e309628:T=1546853213:S=ALNI_Mbdto8xi5qFbZAT79xY5dg-ze4xnA; __utmc=51854390; __utmv=51854390.100--|2=registration_date=20170904=1^3=entry_date=20170904=1; __utmz=51854390.1562828657.7.6.utmcsr=cn.bing.com|utmccn=(referral)|utmcmd=referral|utmcct=/; tst=r; l_n_c=1; l_cap_id="ODM3NjNkNzcyMDYwNDI5MDk3NDU5MmJiMjFhNGVhYTQ=|1570602205|efd74e90bee34399b8a2a0b2634c0ea631262f55"; r_cap_id="ODMyNGFiZWJmZDRjNDBkMDk0ZDViYzZhMzg3Yjk0ZTM=|1570602205|fdffccbacd82b69374c24b77e07c7222fe69bb4a"; cap_id="Nzg1NGZjZWMyZWZhNGQxZjk4OGNiZDEzNTFlMWRmMGM=|1570602205|aff072c242fa668dcfd66cbf2eac82e1c5aaa866"; n_c=1; capsion_ticket="2|1:0|10:1571707597|14:capsion_ticket|44:NDczNGU3MWRlNjJiNDU4MjlmMzk5N2E2OTRhZTcyYjM=|1be0762519c170b5595fd27d9fcf12ad044449af116e2bdc93892e3eca641f27"; z_c0="2|1:0|10:1571707697|4:z_c0|92:Mi4xdGRiY0JRQUFBQUFBb0NNRUlEbnJEU2NBQUFDRUFsVk5NZWpWWFFDYjFSeV9UanFPWDVOd2xtYjltR0pHVkNJSEN3|b1956e3e29ed4b5edbe56e7a2d351a51056feada15e0a7eb31adee42880de999"; q_c1=b2573ca1a2134ace9ffc7113516b6761|1571708014000|1571708014000; __utma=51854390.224633120.1537528699.1562828657.1571884028.9; tgw_l7_route=7bacb9af7224ed68945ce419f4dea76d; Hm_lvt_98beee57fd2ef70ccdd5ca52b9740c49=1571901788,1571901850,1571902840,1571902869; Hm_lpvt_98beee57fd2ef70ccdd5ca52b9740c49=1571902869',
        "content-type": "application/json"
      })
      .end((err, res) => {
        if (err) {
          console.log("请求出错了");
        } else {
          //   console.log(res.text);
          if (typeof res.text !== "undefined") {
            let result = JSON.parse(res.text);
            let dataArray = result.data;
            let obj = [];
            dataArray.forEach((e, i) => {
              let questionAll = {}; //定义的对象放在foreach中
              // console.log(i,e.target.question)
              if (e.target.question) {
                // console.log(e.target.question.id);
                questionAll.id = e.target.question.id;
                questionAll.title = e.target.question.title;
                questionAll.answer_count = e.target.question.answer_count;
                // console.log(questionAll)
                // obj.push(questionAll);
                // console.log(obj)
                obj.push(questionAll);
              }
            });
            // console.log(questionAll)
            resolve(obj);
          }
          // console.log(obj);
        }
      });
    // resolve(obj)
  });
};

//接受一个存储所有问题id的数组
//获得id后要异步访问所有页面
let accessAllHtml = function(arr) {
  return new Promise((resolve, reject) => {
    let url = `https://www.zhihu.com/question/`; //id加上id拼接url
    // console.log(typeof arr)
    // console.log(arr)
    arr.forEach((E, i) => {
      E.forEach((e, i) => {
        //e中储存着所有的问题id
        // console.log(e)
        // console.log(e.id,i)

        //成功根据所有id获取对应的网页内容
        //接下来使用cheerio对网页内容进行分析，获取所有问题下的回答
        //
        superagent
          .get(url + `${e.id}`)
          .set({
            Connection: "keep-alive",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36",
            cookie:
              '_xsrf=jK29u4eQvBfhy7a8E84Tb9v8AoXFYu6i; _zap=9420a2ed-6673-4542-93a0-5b3cb3d7845d; d_c0="AKAjBCA56w2PTvkVrSO6XiGtCGwmoc7QjMs=|1531903857"; __gads=ID=9166dd567e309628:T=1546853213:S=ALNI_Mbdto8xi5qFbZAT79xY5dg-ze4xnA; __utmc=51854390; __utmv=51854390.100--|2=registration_date=20170904=1^3=entry_date=20170904=1; __utmz=51854390.1562828657.7.6.utmcsr=cn.bing.com|utmccn=(referral)|utmcmd=referral|utmcct=/; tst=r; l_n_c=1; l_cap_id="ODM3NjNkNzcyMDYwNDI5MDk3NDU5MmJiMjFhNGVhYTQ=|1570602205|efd74e90bee34399b8a2a0b2634c0ea631262f55"; r_cap_id="ODMyNGFiZWJmZDRjNDBkMDk0ZDViYzZhMzg3Yjk0ZTM=|1570602205|fdffccbacd82b69374c24b77e07c7222fe69bb4a"; cap_id="Nzg1NGZjZWMyZWZhNGQxZjk4OGNiZDEzNTFlMWRmMGM=|1570602205|aff072c242fa668dcfd66cbf2eac82e1c5aaa866"; n_c=1; capsion_ticket="2|1:0|10:1571707597|14:capsion_ticket|44:NDczNGU3MWRlNjJiNDU4MjlmMzk5N2E2OTRhZTcyYjM=|1be0762519c170b5595fd27d9fcf12ad044449af116e2bdc93892e3eca641f27"; z_c0="2|1:0|10:1571707697|4:z_c0|92:Mi4xdGRiY0JRQUFBQUFBb0NNRUlEbnJEU2NBQUFDRUFsVk5NZWpWWFFDYjFSeV9UanFPWDVOd2xtYjltR0pHVkNJSEN3|b1956e3e29ed4b5edbe56e7a2d351a51056feada15e0a7eb31adee42880de999"; q_c1=b2573ca1a2134ace9ffc7113516b6761|1571708014000|1571708014000; __utma=51854390.224633120.1537528699.1562828657.1571884028.9; tgw_l7_route=7bacb9af7224ed68945ce419f4dea76d; Hm_lvt_98beee57fd2ef70ccdd5ca52b9740c49=1571901788,1571901850,1571902840,1571902869; Hm_lpvt_98beee57fd2ef70ccdd5ca52b9740c49=1571902869',
            "content-type": "application/json"
          })
          .end((err, res) => {
            if (err) {
              console.log(err);
            } else {
              AnalysisHtml(res.text);
            }
          });
      });
    });
  });
};
//定义一个分析所有问题的页面返回想要的内容， 作者，标题，时间，点赞数
let AnalysisHtml = function(html) {
  return new Promise((resolve, reject) => {
    let result={
      "author":'',
      "title":'',//问题标题
      "wrapper":'',//回答内容
      "data":'',//回答创建时间
      "type":'answer'

    }
    //superagent请求返回后的文章内容是一个对象.它的data对象是html文本
    //这里的html必须是html格式
    const $ = cheerio.load(html);
    //每一个回答的问题，每一个回答就是一个.list-item
    //作者信息
    //解析对象格式，提取其中的内容
    //attr获取不到data中的数据
    let authorItem = $('.ContentItem')[0].attribs
    let questionAnswer = $(".List-item").text();
    //回答主体
    let questionTitle = $(".QuestionHeader-main").text();
    //回答的内容
    let answerContainer = $(".RichContent-inner").text();
    //获取创建回答的时间
    let createTime = $('.ContentItem-time').text()
    //需要将字符串转换为对象
    let authorItemChage = JSON.parse(authorItem['data-zop'])
    result.author = authorItemChage['authorName']
    result.title = questionTitle
    result.wrapper = answerContainer//文章内容
    result.data = createTime
    // console.log(authorItem)

   
    //  console.log(questionAnswer)
    console.log(result)
   
  });
};

app.use(router.routes());
app.use(router.allowedMethods());

app.listen("3000", () => {
  console.log("监听3000端口");
});
