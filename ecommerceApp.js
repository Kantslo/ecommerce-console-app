import * as readline from "readline";
import * as fs from "fs/promises";

const products = {};
const orders = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function saveProduct(product_id, product_name, product_price) {
  products[product_id] = {
    name: product_name,
    price: parseFloat(product_price),
    balance: 0,
    ordersCount: 0,
    totalOrderPrice: 0,
  };
}

function purchaseProduct(product_id, quantity, price) {
  const product = products[product_id];
  product.balance += parseInt(quantity, 10);
  product.totalOrderPrice += parseFloat(price);
  product.ordersCount += 1;
}

function orderProduct(product_id, quantity) {
  const product = products[product_id];
  if (product.balance >= quantity) {
    product.balance -= quantity;
    orders.push({
      product_id,
      quantity,
      price: product.price * quantity,
    });
  } else {
    console.log("Not enough stock for the order.");
  }
}

function getQuantityOfProduct(product_id) {
  console.log(products[product_id].balance);
}

function getAveragePrice(product_id) {
  const product = products[product_id];

  if (product && product.ordersCount > 0) {
    const averagePrice =
      (product.totalOrderPrice + product.balance * product.price) /
      (product.ordersCount + product.balance);

    console.log(averagePrice);
  } else {
    console.log(`No purchase history for product ${product_id}`);
  }
}

function getProductProfit(product_id) {
  const product = products[product_id];
  const averagePurchasePrice = product.totalOrderPrice / product.ordersCount;
  const averageOrderPrice =
    orders
      .filter((order) => order.product_id === product_id)
      .reduce((sum, order) => sum + order.price, 0) / product.ordersCount;
  const profitPerUnit = averageOrderPrice - averagePurchasePrice;
  const totalProfit = profitPerUnit * product.ordersCount;
  console.log(totalProfit);
}

function getFewestProduct() {
  let fewestProduct = null;
  let minBalance = Infinity;
  for (const [_, product] of Object.entries(products)) {
    if (product.balance < minBalance) {
      minBalance = product.balance;
      fewestProduct = product.name;
    }
  }
  console.log(fewestProduct);
}

function getMostPopularProduct() {
  let mostPopularProduct = null;
  let maxOrdersCount = 0;
  for (const [_, product] of Object.entries(products)) {
    if (product.ordersCount > maxOrdersCount) {
      maxOrdersCount = product.ordersCount;
      mostPopularProduct = product.name;
    }
  }
  console.log(mostPopularProduct);
}

function getOrdersReport() {
  console.log("Product ID\tProduct Name\tQuantity\tPrice\tCOGS\tSelling Price");
  for (const order of orders) {
    const product = products[order.product_id];
    const cogs = product.price * order.quantity;
    const sellingPrice = order.price;
    console.log(
      `${order.product_id}\t${product.name}\t${order.quantity}\t${order.price}\t${cogs}\t${sellingPrice}`
    );
  }
}

async function exportOrdersReport(path) {
  const header = "Product ID,Product Name,Quantity,Price,COGS,Selling Price\n";
  const content = orders
    .map((order) => {
      const product = products[order.product_id];
      const cogs = product.price * order.quantity;
      const sellingPrice = order.price;
      return `${order.product_id},${product.name},${order.quantity},${order.price},${cogs},${sellingPrice}`;
    })
    .join("\n");

  await fs.writeFile(path, header + content);
  console.log(`Report exported to ${path}`);
}

function executeCommand(command) {
  const [action, ...params] = command.split(" ");

  switch (action) {
    case "save_product":
      saveProduct(...params);
      break;
    case "purchase_product":
      purchaseProduct(...params);
      break;
    case "order_product":
      orderProduct(...params);
      break;
    case "get_quantity_of_product":
      getQuantityOfProduct(...params);
      break;
    case "get_average_price":
      getAveragePrice(...params);
      break;
    case "get_product_profit":
      getProductProfit(...params);
      break;
    case "get_fewest_product":
      getFewestProduct();
      break;
    case "get_most_popular_product":
      getMostPopularProduct();
      break;
    case "get_orders_report":
      getOrdersReport();
      break;
    case "export_orders_report":
      exportOrdersReport(params[0]);
      break;
    case "exit":
      rl.close();
      break;
    default:
      console.log("Invalid command");
  }
}

function promptUser() {
  rl.question("Enter a command: ", (command) => {
    executeCommand(command);
    promptUser();
  });
}

console.log("Welcome to the Ecommerce Console App");
promptUser();
