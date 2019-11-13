const fs = require("fs");

fs.readFile("./37.2.txt", "utf-8", (err, data) => {
  if (err) {
    console.log(err);
  } else {
    data2 = data.split(",");
    //2,5,8
	//3,6
	let index = 0
	let index2 = 0
	let result = []
    for (let i = 0; i < 41; i++) {
        index = i+(i+1)*2
		index2 = (i+1)*3
		console.log(data2[index2].slice(7,28))
		// console.log(data2[index2].slice(7,28))
		// let temp = data2[index].slice(17)
		// let time = data2[index2].slice(7,28)
		// result.push({"温度":temp,"时间":time})
    }

	//有逗号的
	// for(let i = 1;i<41;i++){
	// 	index = 2+(i-1)*4
	// 	index2 = 3+(i-1)*4
	// 	console.log(data2[index2].slice(7))
	// }
  }
});
