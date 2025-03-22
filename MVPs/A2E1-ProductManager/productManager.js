const Product = require("./product.js");

class ProductManager {
  products = [];

  addProduct(product) {
    if (this.validateProduct(product)) {
      let size = this.products.length;
      if (size === 0) {
        product.code = 1;
      } else {
        product.code = this.products[size - 1].code + 1;
      }
      this.products.push(product);
    }
  }

  addProducts(products) {
    products.forEach((product) => {
      this.addProduct(product);
    });
  }

  validateProduct(product) {
    if (!product instanceof Product) {
      console.log(
        "Função validateProduct() deve recever uma instância de Product. Recebido " +
          typeof product
      );
      return false;
    }
    return true;
  }

  getProductById(code) {
    let product = this.products.find((p) => p.code === code);
    if (product) {
      // TODO REMOVER
      console.log(product.toString());
      return product;
    }
    console.log("Produto de código " + code + " não encontrado.");
    return null;
  }
}

module.exports = ProductManager;
