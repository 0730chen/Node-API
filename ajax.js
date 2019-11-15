let koa = require("koa");
let querystring = require("querystring");
let fs = require("fs");
let app = new koa();
const Router = require("koa-router");
const superagent = require("superagent");
const cheerio = require("cheerio");
const bodyparser = require("koa-bodyparser");
let router = new Router();
app.use(bodyparser());
let options = {
    hastname: "www.baidu.com",
    port: "80",
    path: "/idnex.html",
    method: 'get',
    agent: false,
}

//koa的事件监听是异步函数

router.post("/login", ctx => {
    ctx.status = 200;
    ctx.set("Content-type", "text/plain;charset=utf-8");
    if (ctx.method === "POST") {
        let postData = ctx.request.body;
        console.log(`穿过来的数据`, postData);
        ctx.body = "ok";
    } else {
        let html = `
      <h1>koa2 request post demo</h1>
      <form method="POST" action="/">
        <p>userName</p>
        <input name="userName" /><br/>
        <p>nickName</p>
        <input name="nickName" /><br/>
        <p>email</p>
        <input name="email" /><br/>
        <button type="submit">submit</button>
      </form>
    `;
        ctx.body = html;
    }
});
router.post("/weather", async ctx => {
    //异步定义解析函数
    function parsePostData(ctx) {
        return new Promise((resolve, reject) => {
            try {
                let postdata = "";
                ctx.req.addListener("data", data => {
                    postdata += data;
                });
                ctx.req.addListener("end", function () {
                    let parseData = parseQueryStr(postdata);
                    resolve(parseData);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    function parseQueryStr(queryStr) {
        let queryData = {};
        let queryStrList = queryStr.split("&");
        console.log(queryStrList);
        for (let [index, queryStr] of queryStrList.entries()) {
            let itemList = queryStr.split("=");
            queryData[itemList[0]] = decodeURIComponent(itemList[1]);
        }
        return queryData;
    }

    let data = "";
    let result = "";
    let cityId = "123";
    ctx.status = 200;
    ctx.set("Content-type", "text/plain;charset=utf-8");
    if (ctx.req.method === "POST") {
        // ctx.req.addListener("data", chunk => {
        //   data += chunk;
        // });
        // let a = ctx.req.addListener("end", () => {
        //   let parseData = querystring.parse(data);
        //   result = parseData;
        //   let Allcity = fs.readFileSync("./city.json").toString();
        //   let AllcityChage = JSON.parse(Allcity);
        //   console.log(Object.keys(parseData)[0]); //取到传递过来的城市名  JSON.Stringify是序列化 JSON.parse是反序列化
        //   let city = Object.keys(parseData)[0];
        //   console.log(city);
        //   cityId = AllcityChage.reduce((item, e) => {
        //     // console.log(e["中文名"] === city)
        //     // console.log(typeof city)
        //     // console.log(city)
        //     if (e["中文名"] === city) {
        //       console.log("找到匹配的城市");
        //       item = e["adcode"];
        //     }
        //     return item;
        //   }, "");
        //   console.log(`我是end里面的数据`, cityId);
        // });
        // ctx.body = cityId;
        let data = ctx.request.body;
        let city = Object.keys(data)[0];
        let Allcity = fs.readFileSync("./city.json").toString();
        let AllcityChage = JSON.parse(Allcity);
        cityId = AllcityChage.reduce((item, e) => {
            // console.log(e["中文名"] === city)
            // console.log(typeof city)
            // console.log(city)
            if (e["中文名"] === city) {
                console.log("找到匹配的城市");
                item = e["adcode"];
            } else {
            }
            return item;
        }, "");
        if (cityId) {
            ctx.body = cityId;
        } else {
            ctx.body = "error";
        }
    }
});
//知乎API可以返回多个文章页面
router.get("/zhihu", async ctx => {
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
    let htmlResult = await accessAllHtml(result);

    // console.log('我是外面的数据',htmlResult);
    //result储存了获取的问题id
    //定义访问获得的所有的问题对应的网站的函数
    ctx.body = htmlResult;
    // let response = await getData(url); //获取到问题的id
});

//获得所有的问题
//1.使用数组储存对象每次push都要是一个新对象，不能是一个对象
let getData = function (url) {
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
                        for (let e of dataArray) {
                            let questionAll = {}; //定义的对象放在foreach中
                            if (e.target.question) {
                                // console.log(e.target.question.id);
                                questionAll.id = e.target.question.id;
                                questionAll.title = e.target.question.title;
                                questionAll.answer_count = e.target.question.answer_count;
                                // console.log(questionAll)
                                obj.push(questionAll);
                                // console.log(obj)
                                obj.push(questionAll);
                            }
                            resolve(obj);
                        }
                    }
                }
            });
    });
};

//接受一个存储所有问题id的数组
//获得id后要异步访问所有页面
let accessAllHtml = async function (arr) {
    return new Promise(async (resolve, reject) => {
        //这个是查找大V的接口
        //搜索热点/search/top_search/tabs/hot/items

        let url = `https://www.zhihu.com/question/`; //id加上id拼接url
        // console.log(typeof arr)
        let resultFinall = [];
        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr[i].length; j++) {
                let res = await superagent.get(url + `${arr[i][j].id}`).set({
                    Connection: "keep-alive",
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36",
                    cookie:
                        '_xsrf=jK29u4eQvBfhy7a8E84Tb9v8AoXFYu6i; _zap=9420a2ed-6673-4542-93a0-5b3cb3d7845d; d_c0="AKAjBCA56w2PTvkVrSO6XiGtCGwmoc7QjMs=|1531903857"; __gads=ID=9166dd567e309628:T=1546853213:S=ALNI_Mbdto8xi5qFbZAT79xY5dg-ze4xnA; __utmc=51854390; __utmv=51854390.100--|2=registration_date=20170904=1^3=entry_date=20170904=1; __utmz=51854390.1562828657.7.6.utmcsr=cn.bing.com|utmccn=(referral)|utmcmd=referral|utmcct=/; tst=r; l_n_c=1; l_cap_id="ODM3NjNkNzcyMDYwNDI5MDk3NDU5MmJiMjFhNGVhYTQ=|1570602205|efd74e90bee34399b8a2a0b2634c0ea631262f55"; r_cap_id="ODMyNGFiZWJmZDRjNDBkMDk0ZDViYzZhMzg3Yjk0ZTM=|1570602205|fdffccbacd82b69374c24b77e07c7222fe69bb4a"; cap_id="Nzg1NGZjZWMyZWZhNGQxZjk4OGNiZDEzNTFlMWRmMGM=|1570602205|aff072c242fa668dcfd66cbf2eac82e1c5aaa866"; n_c=1; capsion_ticket="2|1:0|10:1571707597|14:capsion_ticket|44:NDczNGU3MWRlNjJiNDU4MjlmMzk5N2E2OTRhZTcyYjM=|1be0762519c170b5595fd27d9fcf12ad044449af116e2bdc93892e3eca641f27"; z_c0="2|1:0|10:1571707697|4:z_c0|92:Mi4xdGRiY0JRQUFBQUFBb0NNRUlEbnJEU2NBQUFDRUFsVk5NZWpWWFFDYjFSeV9UanFPWDVOd2xtYjltR0pHVkNJSEN3|b1956e3e29ed4b5edbe56e7a2d351a51056feada15e0a7eb31adee42880de999"; q_c1=b2573ca1a2134ace9ffc7113516b6761|1571708014000|1571708014000; __utma=51854390.224633120.1537528699.1562828657.1571884028.9; tgw_l7_route=7bacb9af7224ed68945ce419f4dea76d; Hm_lvt_98beee57fd2ef70ccdd5ca52b9740c49=1571901788,1571901850,1571902840,1571902869; Hm_lpvt_98beee57fd2ef70ccdd5ca52b9740c49=1571902869',
                    "content-type": "application/json"
                });
                let htmlResult = await AnalysisHtml(res.text);
                resultFinall.push(htmlResult);
                // if(resultFinall.indexOf(htmlResult)){

                // }else{
                //   resultFinall.push(htmlResult)
                // }
                // .then(async (err, res) => {
                //   if (err) {
                //     console.log(err);
                //   }
                //   else {
                //     AnalysisHtml(res.text).then(res => {
                //       //  console.log(res)
                //       resultFinall.push(res);
                //     });
                //   }
                //   // console.log('我是fiall',resultFinall)
                //   // resolve(resultFinall)
                // })
                // console.log(`html`,htmlResult)
            }
            resolve(resultFinall);
        }
    });
};
//传入的是一个html标签 返回的是一个对象 一个分析所有问题的页面返回想要的内容， 作者，标题，时间，点赞数
let AnalysisHtml = async function (html) {
    return new Promise((resolve, reject) => {
        let result = {
            author: "",
            title: "", //问题标题
            wrapper: "", //回答内容
            data: "", //回答创建时间
            type: "answer"
        };
        //superagent请求返回后的文章内容是一个对象.它的data对象是html文本
        //这里的html必须是html格式
        let $ = cheerio.load(html);
        //每一个回答的问题，每一个回答就是一个.list-item
        //作者信息
        //解析对象格式，提取其中的内容
        //attr获取不到data中的数据
        let authorItem = $(".ContentItem")[0].attribs;
        let questionAnswer = $(".List-item").text();
        //回答主体
        let questionTitle = $(".QuestionHeader-title").text();
        //回答的内容
        let answerContainer = $(".RichContent-inner").text();
        //获取创建回答的时间
        let createTime = $(".ContentItem-time").text();
        //需要将字符串转换为对象
        let authorItemChage = JSON.parse(authorItem["data-zop"]);
        result.author = authorItemChage["authorName"];
        result.title = questionTitle;
        result.wrapper = answerContainer; //文章内容
        result.data = createTime;
        // console.log(authorItem)
        //练习使用解析赋值
        //let {author,title} = result  相当于使用result.author
        //  console.log(questionAnswer)
        resolve(result);
    });
};

//抓取这个是知乎的热点APi热点消息
router.get("/hot", async ctx => {
    //  let url ="https://api.zhihu.com/"+`moments?feed_type=all&limit=10&reverse_order=0&start_type=warm`
    // url = `https://movie.douban.com/explore#!type=movie&tag=%E7%83%AD%E9%97%A8&sort=recommend&page_limit=20&page_start=20`;
    //知乎热榜    https://www.zhihu.com/hot
    //微博 热榜https://s.weibo.com/top/summary
    let url = "https://www.zhihu.com/hot";
    let data = await superagent.get(url).set({
        Connection: "keep-alive",
        "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36",
        "content-type": "application/json",
        cookie:
            '_xsrf=jK29u4eQvBfhy7a8E84Tb9v8AoXFYu6i; _zap=9420a2ed-6673-4542-93a0-5b3cb3d7845d; d_c0="AKAjBCA56w2PTvkVrSO6XiGtCGwmoc7QjMs=|1531903857"; __gads=ID=9166dd567e309628:T=1546853213:S=ALNI_Mbdto8xi5qFbZAT79xY5dg-ze4xnA; __utmc=51854390; __utmv=51854390.100--|2=registration_date=20170904=1^3=entry_date=20170904=1; __utmz=51854390.1562828657.7.6.utmcsr=cn.bing.com|utmccn=(referral)|utmcmd=referral|utmcct=/; tst=r; l_n_c=1; l_cap_id="ODM3NjNkNzcyMDYwNDI5MDk3NDU5MmJiMjFhNGVhYTQ=|1570602205|efd74e90bee34399b8a2a0b2634c0ea631262f55"; r_cap_id="ODMyNGFiZWJmZDRjNDBkMDk0ZDViYzZhMzg3Yjk0ZTM=|1570602205|fdffccbacd82b69374c24b77e07c7222fe69bb4a"; cap_id="Nzg1NGZjZWMyZWZhNGQxZjk4OGNiZDEzNTFlMWRmMGM=|1570602205|aff072c242fa668dcfd66cbf2eac82e1c5aaa866"; n_c=1; capsion_ticket="2|1:0|10:1571707597|14:capsion_ticket|44:NDczNGU3MWRlNjJiNDU4MjlmMzk5N2E2OTRhZTcyYjM=|1be0762519c170b5595fd27d9fcf12ad044449af116e2bdc93892e3eca641f27"; z_c0="2|1:0|10:1571707697|4:z_c0|92:Mi4xdGRiY0JRQUFBQUFBb0NNRUlEbnJEU2NBQUFDRUFsVk5NZWpWWFFDYjFSeV9UanFPWDVOd2xtYjltR0pHVkNJSEN3|b1956e3e29ed4b5edbe56e7a2d351a51056feada15e0a7eb31adee42880de999"; q_c1=b2573ca1a2134ace9ffc7113516b6761|1571708014000|1571708014000; __utma=51854390.224633120.1537528699.1562828657.1571884028.9; tgw_l7_route=7bacb9af7224ed68945ce419f4dea76d; Hm_lvt_98beee57fd2ef70ccdd5ca52b9740c49=1571901788,1571901850,1571902840,1571902869; Hm_lpvt_98beee57fd2ef70ccdd5ca52b9740c49=1571902869',
        "content-type": "application/json"
    });
    let HotArray = [];
    let ItemIndexArray = [];
    let HotTitleArray = [];
    let HotMetricsArray = [];
    let html = data.text;
    let $ = cheerio.load(html);
    const container = $(".HotList-list");
    //全部输入完才会执行下一个句
    //寻找网页链接
    //需要使用一个循环才能获取到这个热榜链接
    //获得了页面的链接
    let LinkArray = [];
    let HotLink;
    let HotTitle;
    let HotExcept;
    let HotRank;
    let ImgLink;
    let hash = {};
    for (let i = 0; i < 46; i++) {
        //try catch捕获错误
        try {
            //获取了链接地址
            HotLink = container
                .find(".HotItem")
                .find(".HotItem-content")
                .next()[i]["attribs"]["href"];
            //获取了title
            HotTitle = container.find(".HotItem").find(".HotItem-content")[i]["next"][
                "attribs"
                ]["title"];
            ImgLink = container.find(".HotItem").find(".HotItem-img")[i][
                "children"
                ][0]["attribs"]["src"];
            //获取except
            // HotExcept = container.find(".HotItem").find(".HotItem-excerpt")[i][
            //   "children"
            // ][0]["data"];
            //获取热度
            HotRank = container.find(".HotItem").find(".HotItem-metrics")[i][
                "children"
                ][1]["data"];
        } catch (error) {
            HotLink = "没有属性";
            ImgLink = "没有图片";
        }
        LinkArray.push({
            Title: HotTitle,
            Rank: HotRank,
            Link: HotLink,
            HotImg: ImgLink,
            index: i
        });
    }

    //reduce使用hash处理获得的重复数据
    //目前只能看热点内容，移动端点击后会跳转到下载APP姐界面
    ctx.body = LinkArray.reduce((item, e) => {
        if (hash[e.Title]) {
        } else {
            hash[e.Title] = e.Title;
            item.push(e);
        }
        return item;
    }, []);
});

//微博接口完成
//1.在使用url时需要拼接字符串
router.get("/weibo", async ctx => {
    let url = "https://s.weibo.com/top/summary";
    let data = await superagent.get(url).set({
        Connection: "keep-alive",
        "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36",
        "content-type": "application/json"
    });
    let html = data.text;
    let $ = cheerio.load(html);
    let container = $("tbody");
    let item = container.find("tr");
    let $a;
    let $href;
    let title;
    let allArray = [];
    for (let i = 0; i < 51; i++) {
        //$a就是a标签的全部内容是一个对象
        $a = container.find(".td-02")[i]["children"][0]["next"];
        href = `https://s.weibo.com/` + $a["attribs"]["href"]; //a标签中的链接
        title = $a["children"][0]["data"];
        allArray.push({Rank: i + 1, Link: href, Title: title}); //获取热搜标题
    }
    ctx.body = allArray;
});


//获取标题内容
router.get("/github", async ctx => {
    let url = "https://github.com/trending";
    let data = await superagent.get(url).set({
        Connection: "keep-alive",
        "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36",
        "content-type": "application/json"
    });
    let html = data.text;
    let allArray = []
    let $ = cheerio.load(html);
    let $box = $(".Box");
    for (let i = 0; i < 21; i++) {
        //h1标签中隐藏着项目内容和链接
        //获得了热门项目的链接 需要拼接 https://github.com/
        let baseUrl = `https://github.com/`
        let href = $box.find('.Box-row')[i]["children"][2]["next"]["children"][1]["attribs"]["href"]
        let title = $box.find('.Box-row')[0]["children"][2]["next"]["children"][1]["children"][2]["next"]["children"][0]["data"]
        let title2 = $box.find('.Box-row').find('.text-normal')[i]["next"]["data"]
        //获得了全部的标题和链接
        let url = baseUrl + href
        let Title = title + title2
        allArray.push({"link": url, "title": Title})
    }
    console.log(allArray)
    ctx.body = allArray
});

//构建语言热度排行榜
//无法访问外网获得数据
router.get('/language', async ctx => {
    let url = "https://www.tiobe.com/tiobe-index/" //百度热榜
    let data = await superagent.get(url).set({
        Connection: "keep-alive",
        "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36",
        "content-type": "application/json",
    })
    let html = data.text
    let $ = cheerio.load(html, {decodeEntities: false})
    let $container = $("tbody")
    let allArray = []
    for (let i = 0; i < 20; i++) {
        let $item = $container.find('tr')[0]["children"][2]
        let Rank = $container.find('tr')[i]["children"][0]["children"][0]["data"]
        let Title = $container.find('tr')[i]["children"][3]["children"][0]["data"]//获取到了标题内容
        allArray.push({"Title": Title, "Rank": Rank})
    }
    ctx.body = allArray

})

app.use(router.routes());
app.use(router.allowedMethods());

app.listen("8000", () => {
    console.log("监听8000端口");
});
