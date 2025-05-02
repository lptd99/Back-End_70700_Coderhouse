import { promises as fs } from "fs";
import path from "path";
import Product from "./product.model.js";

class ProductManager {
  products = [];
  path = "./data/products.json";
  constructor(customFilePath) {
    if (customFilePath) {
      this.path = customFilePath;
    }
    this.#createFile();
  }

  async #createFile() {
    try {
      const dir = path.dirname(this.path);
      await fs.mkdir(dir, { recursive: true });
      await fs.access(this.path);
    } catch (err) {
      console.log(
        `Arquivo não encontrado no caminho ${this.path}. Criando novo...`
      );
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
      this.products = this.products.map((product) => {
        const newProduct = new Product(
          product.title,
          product.description,
          product.price,
          product.stock,
          product.thumbnail,
          product.category,
          product.status
        );
        newProduct.code = product.code;
        return newProduct;
      });
      console.log("Produtos instanciados com sucesso.");
      console.log("Quantidade de produtos: " + this.products.length);

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
    let newProduct = null;
    try {
      newProduct = new Product(
        product.title,
        product.description,
        product.price,
        product.stock,
        product.thumbnail,
        product.category,
        product.status
      );
    } catch {
      console.log(
        "Erro ao criar produto. Verifique os dados do produto: " + product
      );
      return null;
    }
    if (this.validateProduct(newProduct)) {
      let size = this.products.length;
      if (size === 0) {
        newProduct.code = 1;
      } else {
        newProduct.code = this.products[size - 1].code + 1;
      }
      this.products.push(newProduct);
      await this.#saveProducts();
      return newProduct;
    } else {
      console.log(
        "Produto inválido. Não foi possível adicionar o produto ao arquivo."
      );
      return null;
    }
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

  async updateProduct(id, product) {
    let result = false;
    if (this.getProductById(id)) {
      if (this.validateProduct(product)) {
        let index = this.products.findIndex((p) => p.code === id);
        if (index !== -1) {
          this.products[index] = product;
          this.products[index].code = id;
          console.log("Produto de código " + id + " atualizado.");
          this.#saveProducts();
          result = true;
        }
      }
    }
    return result;
  }

  async deleteProduct(id) {
    let result = false;
    if (await this.getProductById(id)) {
      this.products = this.products.filter((p) => p.code !== id);
      console.log("Produto de código " + id + " removido.");
      await this.#saveProducts();
      result = true;
    }
    return result;
  }
}
export default ProductManager;
