const fs = require('fs');
var path = require('path')
fs.readFile(path.join(__dirname, 'Joined.json'), handleFile)

// Write the callback function
function handleFile(err, data) {
    if (err) throw err
    customers = JSON.parse(data)
    console.log(customers[2]);
}
