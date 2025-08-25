import productModel from "../../src/dao/models/product.model.js";
productModel;

export default class Products {
  getProducts = async () => {
    try {
      const products = await productModel.find();
      return products;
    } catch (error) {
      throw new Error("Error getting products");
    }
  };

  getProductById = async (id) => {
    try {
      const product = await productModel.findById(id);
      return product;
    } catch (error) {
      throw new Error("Error getting product by ID");
    }
  };

  getProductStock = async (id) => {
    try {
      const product = await productModel.findById(id);
      return product.stock;
    } catch (error) {
      throw new Error("Error getting product stock");
    }
  };
}
