import { expect } from "chai";
import mongoose from "mongoose";
import Carts from "./dao/Carts.dao.js";
import Products from "./dao/Products.dao.js";

const atlas_db_connection_string =
  "mongodb+srv://admin:admin@backendcoderhouse.o9csx.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=BackEndCoderhouse";
const userId = "68ab9bc65534d4bff3590979";
const productId = "68a39a2845ec4368a37815e9";

before(async () => {
  try {
    await mongoose.connect(atlas_db_connection_string); // TO DO TODO : CADE O ENV
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
});

after(async () => {
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
});

describe("1) -> Dao Carts = = = = =", () => {
  let cartsDao;
  before(async () => {
    cartsDao = new Carts();
  });
  beforeEach(function () {
    this.timeout(5000);
  });
  //SE O CARRINHO EXISTE
  describe("1.A) getCartByUserId", () => {
    it("must return a cart with user and products[]", async () => {
      const cart = await cartsDao.getCartByUserId(userId);
      expect(cart).to.have.property("user").that.is.not.null;
      expect(cart).to.have.property("products").that.is.an("array");
    });
  });

  //SE JA TEM ESTE PRODUTO NO CARRINHO
  describe("1.B) productExistsInCart", () => {
    it("must return true if product exists in cart", async () => {
      const exists = await cartsDao.productExistsInCart(productId, userId);
      expect(exists).to.be.true;
    });
  });
  afterEach(function () {
    if (this.currentTest.state === "failed") {
      console.log("Tested variable:", this.currentTest.title);
    }
  });
});

describe("2) -> Dao Products = = = = =", () => {
  let productsDao;
  before(async () => {
    productsDao = new Products();
  });
  beforeEach(function () {
    this.timeout(5000);
  });
  // SE EXISTEM PRODUTOS
  describe("2.A) getProducts", () => {
    it("must return an array of products", async () => {
      const products = await productsDao.getProducts();
      expect(products).to.be.an("array");
      expect(products.length).to.be.greaterThan(0);
    });
  });
  // SE O PROD EXISTE
  describe("2.B) getProductById", () => {
    it("must return a product if it exists", async () => {
      const product = await productsDao.getProductById(productId);
      expect(product).to.have.property("_id");
    });
  });
  // SE O PROD TEM ESTOQUE
  describe("2.C) getProductStock", () => {
    it("must return the stock of a product", async () => {
      const stock = await productsDao.getProductStock(productId);
      expect(stock).to.be.a("number");
      expect(stock).to.be.greaterThan(0);
    });
  });
});
