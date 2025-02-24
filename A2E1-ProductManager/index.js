const ProductManager = require("./productManager");
const Product = require("./product");

const productManager = new ProductManager();

const product1 = new Product(
  "Product 1",
  "Description 1",
  100,
  "thumbnail1",
  10
);

const product2 = new Product(
  "Product 2",
  "Description 2",
  200,
  "thumbnail2",
  20
);

productManager.addProduct(product1);
productManager.addProduct(product2);

productManager.showProductById(1);
productManager.showProductById(2);

product2.updateFields(
  "Product 2 Updated",
  "Description 2 Updated",
  250,
  "thumbnail2Updated",
  25
);

productManager.updateProduct(product2);

product1.updateField("price", 150);
product1.updateField("thumbnail", "thumbnail1Updated");
productManager.updateProduct(product1);
productManager.showProductById(1);

productManager.showProductById(2);

productManager.removeProductById(1);

productManager.showProductById(1);

productManager.removeAllProducts();

productManager.showProductById(2);
