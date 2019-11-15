const fs = require("fs");

fs.readFile("./renti.log", "utf-8", (err, data) => {
    if (err) {
        console.log(err);
    } else {
        console.log(data)
        data2 = data.split('C')
    }
    for (let i = 2; i < data2.length; i++) {
        console.log(data2[i].slice(44))
    }


});
