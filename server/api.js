var request = require('request');
const fs = require('fs');
var url = 'http://api.reimaginebanking.com/customers/'


var customers,accounts;
// Read the file and send to the callback
fs.readFile('Customer.json', handleFile)

// Write the callback function
function handleFile(err, data) {
    if (err) throw err
    customers = JSON.parse(data).results
    fs.readFile('Account.json', handleFileAccount)

}

function handleFileAccount(err,data) {
  if (err) throw err
  accounts = JSON.parse(data).results
  for(var i = 0; i < customers.length; i++) {
    var customerId = customers[i]['_id'];
    customers[i]['savings'] = 0;
    customers[i]['balance'] = 0;
    for(var j = 0; j < accounts.length; j++) {
      var acc = accounts[j];
      if(acc.customer_id === customerId) {
        if(acc.type === 'Savings') {
          customers[i]['savings'] += acc.balance;
        }
        if(acc.type === 'Credit Card') {
            customers[i]['balance'] += acc.balance;
        }
      }
    }
  }

  fs.writeFile("Joined.json", JSON.stringify(customers), 'utf8', function (err) {
      if (err) {
          return console.log(err);
      }
      console.log("The file was saved!");
  });
}
