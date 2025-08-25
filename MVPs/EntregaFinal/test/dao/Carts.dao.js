import cartModel from "../../src/dao/models/cart.model.js";

export default class Carts {
  create = async (cartData) => {
    try {
      const newCart = await cartModel.create(cartData);
      return newCart;
    } catch (error) {
      throw new Error("Error creating cart");
    }
  };

  getCartByUserId = async (userId) => {
    try {
      const cart = await cartModel.findOne({ user: userId });
      return cart;
    } catch (error) {
      throw new Error("Error getting cart by user ID");
    }
  };

  getProductsFrom = async (cart) => {
    try {
      const products = cart.products;
      console.log(products);

      return products;
    } catch (error) {
      throw new Error("Error getting products from cart");
    }
  };

  productExistsInCart = async (productId, userId) => {
    try {
      console.log(productId);
      const cart = await cartModel.findOne({ user: userId });
      const idx = cart.products.findIndex((p) => {
        return p.product && p.product.toString() === productId.toString();
      });
      return idx !== -1;
    } catch (error) {
      throw new Error("Error checking if product exists in cart");
    }
  };
}
