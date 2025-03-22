const Product = require("./product.js");
const ProductManager = require("./productManager.js");

const productManager = new ProductManager();

console.log("creating products...");
const prod1 = new Product("Product 1", "Description 1", 100, 10, "thumbnail1");
const prod2 = new Product("Product 2", "Description 2", 200, 20, "thumbnail2");
const prod3 = new Product("Product 3", "Description 3", 300, 30, "thumbnail3");

const prod4 = new Product("Product 4", "Description 4", 400, 40, "thumbnail4");
const prod5 = new Product("Product 5", "Description 5", 500, 50, "thumbnail5");
const prod0 = new Product("Product 0", "Description 0", 0, 0, "thumbnail0");
console.log("prod0");
// const prod00 = new Product("Product 00", "", 0, 0, "thumbnail00");
// const prod000 = new Product(
//   "Product 000",
//   "Description 000",
//   null,
//   0,
//   "thumbnail000"
// );
// const prod0000 = new Product(
//   "Product 0000",
//   "Description 0000",
//   0,
//   null,
//   "thumbnail0000"
// );
// const prod00000 = new Product("Product 00000", "Description 00000", 0, 0, "");

console.log("adding products one by one...");
productManager.addProduct(prod1);
productManager.addProduct(prod2);

console.log("adding products all at once...");
productManager.addProducts([prod3, prod4, prod5, prod0]);

console.log("trying to add invalid products...");
// productManager.addProducts([prod0, prod00, prod000, prod0000, prod00000]);

console.log("getting products...");
productManager.products.forEach((p) => {
  productManager.getProductById(p.code);
});

console.log("trying to get invalid products...");
productManager.getProductById(0);
productManager.getProductById(8);
productManager.getProductById(99);
productManager.getProductById(15);
