
var url = 'http://api.reimaginebanking.com/merchants?key=e9a936c7c96fb53741cc5771c6c0f6e7'

const fs = require('fs');
var content;

var request = require('request');
request(url, function (error, response, body) {
  content = body;
  fs.writeFile("Merchant.json", content, 'utf8', function (err) {
      if (err) {
          return console.log(err);
      }
      console.log("The file was saved!");
  });
});
