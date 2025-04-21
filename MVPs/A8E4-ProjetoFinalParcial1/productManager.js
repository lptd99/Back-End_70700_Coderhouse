const Product = require("./product.js");
const path = require("path");
const fs = require("fs").promises;

class ProductManager {
  products = [];
  path = "";
  constructor(filePath) {
    this.path = filePath;
    this.#createFile();
  }

  async #createFile() {
    try {
      const dir = path.dirname(this.path);
      await fs.mkdir(dir, { recursive: true });
      await fs.access(this.path);
    } catch (err) {
      console.log("Arquivo não encontrado. Criando novo...");
      await fs.writeFile(this.path, "[]"); // Criar arquivo JSON vazio
    }
  }

  async #loadProducts() {
    try {
      try {
        await fs.access(this.path);
      } catch {
        await this.#createFile();
      }

      let resultado = await fs.readFile(this.path, "utf-8");

      this.products = resultado.trim() ? JSON.parse(resultado) : [];
      return this.products;
    } catch (err) {
      console.error("Erro ao ler o arquivo:", err.message);
      return [];
    }
  }

  async #saveProducts() {
    await fs.writeFile(this.path, JSON.stringify(this.products, null, 2));
  }

  async addProduct(product) {
    await this.#loadProducts();
    if (this.validateProduct(product)) {
      let size = this.products.length;
      if (size === 0) {
        product.code = 1;
      } else {
        product.code = this.products[size - 1].code + 1;
      }
      this.products.push(product);
    }
    await this.#saveProducts();
  }

  async addProducts(productsList) {
    for (const product of productsList) {
      await this.addProduct(product);
    }
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

  async getProductById(code) {
    await this.#loadProducts();
    let product = this.products.find((p) => p.code === code);
    if (product) {
      // TODO REMOVER
      console.log(product);
      return product;
    }
    console.log("Produto de código " + code + " não encontrado.");
    return null;
  }

  async getProducts(limit = 0) {
    await this.#loadProducts();
    if (limit > 0) {
      return this.products.slice(0, limit);
    }
    return this.products;
  }

  updateProduct(id, product) {
    if (this.getProductById(id)) {
      if (this.validateProduct(product)) {
        let index = this.products.findIndex((p) => p.code === id);
        if (index !== -1) {
          this.products[index] = product;
          console.log("Produto de código " + id + " atualizado.");
          this.#saveProducts();
        }
      }
    }
  }

  async deleteProductById(id) {
    if (await this.getProductById(id)) {
      this.products = this.products.filter((p) => p.code !== id);
      console.log("Produto de código " + id + " removido.");
      await this.#saveProducts();
    }
  }
}

module.exports = ProductManager;
