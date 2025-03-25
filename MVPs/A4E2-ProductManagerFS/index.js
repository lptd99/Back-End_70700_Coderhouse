const Product = require("./product.js");
const ProductManager = require("./productManager.js");
const fs = require("fs").promises;

const dataPath = "./data/products.json";

const productManager = new ProductManager(dataPath);

console.log("creating products...");
const prod1 = new Product("Product 1", "Description 1", 100, 10, "thumbnail1");
const prod2 = new Product("Product 2", "Description 2", 200, 20, "thumbnail2");
const prod3 = new Product("Product 3", "Description 3", 300, 30, "thumbnail3");

const prod4 = new Product("Product 4", "Description 4", 400, 40, "thumbnail4");
const prod5 = new Product("Product 5", "Description 5", 500, 50, "thumbnail5");
const prod0 = new Product("Product 0", "Description 0", 0, 0, "thumbnail0");
console.log("prod0");

async function main() {
  console.log("adding products one by one...");
  await productManager.addProduct(prod1);
  await productManager.addProduct(prod2);

  console.log("adding products all at once...");
  await productManager.addProducts([prod3, prod4, prod5, prod0]);

  console.log("trying to add invalid products...");

  console.log("getting products...");
  productManager.products.forEach(async (p) => {
    await productManager.getProductById(p.code);
  });

  console.log("trying to get invalid products...");
  await productManager.getProductById(0);
  await productManager.getProductById(8);
  await productManager.getProductById(99);
  await productManager.getProductById(15);
  await productManager.deleteProductById(1);
  await productManager.deleteProductById(3);
  await productManager.deleteProductById(5);
  await productManager.deleteProductById(7);
  await productManager.deleteProductById(9);

  console.log(await productManager.getProducts());
}

main();
