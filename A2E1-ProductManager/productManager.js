const aux = require("./auxiliaryFunctions");

class ProductManager {
  products;
  constructor() {
    this.products = [];
  }

  // C SINGLE
  addProduct(product) {
    aux.dLog(`addProduct(${product.id}) start`);
    const previousLength = this.products.length;
    aux.dLog(`Adicionando Produto gerenciado #${product.id}...`);
    this.getProductById(product.id)
      ? console.log(
          `Produto gerenciado #${product.id} já existe, abortando adição.`
        )
      : this.products.push(product);
    if (this.products.length > previousLength) {
      console.log(`Produto gerenciado #${product.id} adicionado com sucesso.`);
      aux.dLog(`addProduct(${product.id}) end (true)`);
      return true;
    } else {
      console.log(`Falha na adição do Produto gerenciado #${product.id}.`);
      aux.dLog(`addProduct(${product.id}) end (false)`);
      return false;
    }
  }

  // C MULTIPLE
  addProducts(products) {
    aux.dLog(`addProducts(${products.length}) start`);
    const previousLength = this.products.length;
    products.forEach((p) => this.addProduct(p));
    console.log(
      `${this.products.length - previousLength} de ${
        products.length
      } produtos adicionados com sucesso.`
    );
    aux.dLog(`addProducts(${products.length}) end`);
  }

  // R SINGLE
  getProductById(id) {
    aux.dLog(`getProductById(${id}) start`);
    const product = this.products.find((p) => p.id === id);
    console.log(
      `Produto gerenciado #${id}${product ? " " : " não "}encontrado.`
    );
    aux.dLog(`getProductById(${id}) end`);
    return product;
  }

  // R MULTIPLE
  getProductsByIds(ids) {
    aux.dLog(`getProductsByIds(${ids}) start`);
    const foundProducts = [];
    ids.forEach((id) => {
      aux.dLog(`ids.forEach(${id}) start`);
      const product = this.getProductById(id);
      aux.dLog(`Produto${product ? " " : " não "}encontrado.`);
      product ? foundProducts.push(product) : null;
      aux.dLog(`ids.forEach(${id}) end`);
    });
    aux.dLog(`getProductsByIds(${ids}) end`);
    console.log(
      `${foundProducts.length} de ${ids.length} produtos encontrados.`
    );
    return foundProducts;
  }

  // R ALL
  getProducts() {
    return this.products;
  }

  // U SINGLE, ONE FIELD
  updateProductById(id, field, value) {
    const product = this.getProductById(id);
    if (product) {
      product[field] = value;
      console.log(`Produto gerenciado #${id} atualizado com sucesso.`);
    } else {
      console.log(`Produto gerenciado #${id} não encontrado.`);
    }
  }

  // U SINGLE, ALL FIELDS
  updateProductById(id, title, description, price, thumbnail, stock) {
    const product = this.getProductById(id);
    if (product) {
      product.update(title, description, price, thumbnail, stock);
      console.log(`Produto gerenciado #${id} atualizado com sucesso.`);
    } else {
      console.log(`Produto gerenciado #${id} não encontrado.`);
    }
  }

  // U SINGLE, OBJECT
  updateProduct(newProduct) {
    const product = this.getProductById(newProduct.id);
    if (product) {
      try {
        product.updateProduct(newProduct);
        console.log(
          `Produto gerenciado #${product.id} atualizado com sucesso.`
        );
        return true;
      } catch {
        console.log(`Falha ao atualizar Produto gerenciado #${product.id}.`);
        return false;
      }
    } else {
      console.log(`Produto gerenciado #${product.id} não encontrado.`);
      return false;
    }
  }

  // D SINGLE
  removeProductById(id) {
    const previousLength = this.products.length;
    this.products = this.products.filter((p) => p.id !== id);
    console.log(
      `Produto gerenciado #${id} ${
        previousLength === this.products.length
          ? "não encontrado."
          : "removido com sucesso."
      }`
    );
  }

  // D MULTIPLE
  removeProductsByIds(ids) {
    const previousLength = this.products.length;
    ids.forEach((id) => this.removeProductById(id));
    console.log(
      `${previousLength - this.products.length} de ${
        ids.length
      } produtos removidos com sucesso.`
    );
  }

  // D ALL
  removeAllProducts() {
    this.products = [];
    console.log("Todos os produtos removidos com sucesso.");
  }

  // SHOW SINGLE
  showProductById(id) {
    const product = this.getProductById(id);
    if (product) {
      product.show();
      return true;
    } else {
      console.log(`Produto gerenciado #${id} não exibido.`);
      return false;
    }
  }

  // SHOW MULTIPLE
  showProductsByIds(ids) {
    let found = 0;
    ids.forEach((id) => (this.showProductById(id) ? found++ : null));
    console.log(`${found} de ${ids.length} produtos exibidos.`);
  }

  // SHOW ALL
  showProducts() {
    console.log(`Exibindo todos os ${this.products.length} produtos:`);
    this.products.forEach((p) => p.show());
  }
}

module.exports = ProductManager;
