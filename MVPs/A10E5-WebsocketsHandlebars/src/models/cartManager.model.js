import { promises as fs } from "fs";
import path from "path";
import Cart from "./cart.model.js";

class CartManager {
  carts = [];
  path = "./data/carts.json";
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

  async #loadCarts() {
    try {
      try {
        await fs.access(this.path);
      } catch {
        await this.#createFile();
      }

      let resultado = await fs.readFile(this.path, "utf-8");

      this.carts = resultado.trim() ? JSON.parse(resultado) : [];
      this.carts = this.carts.map((cart) => {
        const newCart = new Cart(cart.userId);
        newCart.products = cart.products;
        return newCart;
      });
      console.log("Carrinhos instanciados com sucesso.");
      return this.carts;
    } catch (err) {
      console.error("Erro ao ler o arquivo:", err.message);
      return [];
    }
  }

  async saveCarts() {
    await fs.writeFile(this.path, JSON.stringify(this.carts, null, 2));
  }

  async createIfNoCart(userId) {
    let cart = this.carts.find((c) => c.userId === userId);
    if (!cart) {
      console.log(
        `Carrinho não encontrado para usuario de id ${userId}. Criando...`
      );
      cart = new Cart(userId);
      this.carts.push(cart);
      await this.saveCarts();
    } else {
      console.log(
        `Carrinho encontrado para usuario de id ${userId}. Carregando...`
      );
    }
    return cart;
  }

  async addCart(newCart) {
    await this.#loadCarts();
    const existingCart = this.carts.find((c) => c.userId === newCart.userId);
    if (existingCart) {
      newCart.reduce((acc, product) => {
        acc.addProduct(product.id, product.quantity);
        return acc;
      }, existingCart);
      return existingCart;
    } else {
      this.carts.push(newCart);
      await this.saveCarts();
      console.log(
        `Carrinho adicionado com sucesso para usuario de id ${newCart.userId}.`
      );
      return newCart;
    }
  }

  async getCarts(limit = 0) {
    await this.#loadCarts();
    if (limit > 0) {
      return this.carts.slice(0, limit);
    }
    return this.carts;
  }

  async getCartById(userId) {
    await this.#loadCarts();
    const cart = await this.createIfNoCart(userId);
    return cart;
  }

  async getProductsFromCart(userId) {
    await this.#loadCarts();
    const cart = await this.createIfNoCart(userId);
    const products = cart.getProducts();
    if (products.length === 0) {
      console.log(`Carrinho do usuario de id ${userId} está vazio.`);
    }
    return products;
  }

  async addProductToCart(userId, productId, addQuantity = 1) {
    await this.#loadCarts();
    const cart = await this.createIfNoCart(userId);
    await cart.addProduct(productId, addQuantity);
    console.log(
      `Produto de código ${productId} adicionado ao carrinho do usuario de id ${userId} com sucesso (${addQuantity} un.).`
    );
    await this.saveCarts();
  }

  async removeProductFromCart(userId, productId, removeQuantity = 1) {
    await this.#loadCarts();
    const cart = createIfNoCart(cart);
    cart.removeProduct(productId, removeQuantity);
    console.log(
      `Produto de código ${productId} removido do carrinho do usuario de id ${userId} com sucesso.`
    );
    await this.saveCarts();
  }
}
export default CartManager;
