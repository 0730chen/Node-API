  var exceltojson = require("xlsx-to-json-lc"); //或者xlsx-to-json-lc，取决于你的文件名。
  exceltojson({
    input: "./AMap_adcode_citycode.xlsx", //要转换的excel文件，如"/Users/chenyihui/文件/matt/1_2.xlsx"
    output: "./city.json", //输出的json文件，可以不写。如"./yeap.json"
   // 如果有多个表单的话，制定一个表单（excel下面那些标签），可以忽略 //所有英文表头转成大写，可以忽略
  }, function(err, result) {
    if(err) {
      console.error(err);
    } else {
      console.log(result);
      //result will contain the overted json data
    }
  });