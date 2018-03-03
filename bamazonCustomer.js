require("dotenv").config();
var keys = require("./keys");
var inquirer = require('inquirer');
var mysql = require('mysql');
var dbPass = keys.databasePassword.pass_word;
let ballId;
let quantityOrdered;
var questions = [
    {
        type: 'input',
        name: 'product_selection',
        message: "Which type of balls would you like to purchase? Please specify by product number " + '\n'
    },
    {
        type: 'input',
        name: 'quantity',
        message: "How many dozen would you like to purchase?"
    }
];

var connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: dbPass,
    database: 'bamazon'
});

function selectAll() {
    connection.query("SELECT * FROM products", function (err, response) {
        if (err) throw err;
        response.forEach(element => {
            console.log("Product #" + element.item_id + " " + element.product_name + " " + "$" + element.price);
        });
        askThem();
    })
}

function askThem() {
    inquirer.prompt(questions).then(answers => {
        ballId = parseInt(answers.product_selection);
        quantityOrdered = parseInt(answers.quantity);
        console.log(ballId);
        console.log(quantityOrdered);
        checkStock();
    });

}

function checkStock() {
    var query = "SELECT stock_quantity, price, item_id FROM products WHERE ?";
    connection.query(query, { item_id: ballId }, function (err, res) {
        if (res[0].stock_quantity < quantityOrdered) {
            console.log("Insufficient Stock!");
            console.log("Please try a new amount and we might be able to fill your order!");
            askThem();
        }
        else {
            console.log("Your order has been placed!!")
            placeOrder(res);
            displayPrice(res);
        }

    });

}

function placeOrder(x) {
    var newStockQuantity = x[0].stock_quantity - quantityOrdered;
    var newId = x[0].item_id;
    var query = `UPDATE products SET stock_quantity = ${newStockQuantity} WHERE ?`;

    connection.query(query, { item_id: newId }, function (err, result) {
        if (err) throw err;
        connection.end();
    });
}

function displayPrice(x) {
    var totalPrice = x[0].price * quantityOrdered;
    console.log(`Your order total is: $ ${totalPrice}`)
}

connection.connect(function (err) {
    if (err) {
        throw err;
    }
    selectAll();
});

