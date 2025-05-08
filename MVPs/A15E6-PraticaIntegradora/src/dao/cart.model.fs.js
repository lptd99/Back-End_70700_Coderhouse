class Cart {
  constructor(id) {
    this.userId = id;
    this.products = [];
  }

  addProduct(productId, addQuantity = 1) {
    let product = this.products.find((p) => p.id === productId);
    if (product) {
      product.quantity += addQuantity;
    } else {
      this.products.push({ id: productId, quantity: addQuantity });
    }
  }

  getProducts() {
    return this.products;
  }

  removeProduct(productId, removeQuantity = 1) {
    let product = this.products.find((p) => p.id === productId);
    if (product) {
      if (product.quantity - removeQuantity <= 0) {
        console.log(`Removendo produto de id ${productId} do carrinho.`);
        this.products = this.products.filter((p) => p.id !== productId);
      } else {
        console.log(
          `Removendo ${removeQuantity} unidades do produto de id ${productId} do carrinho.`
        );
        product.quantity -= removeQuantity;
      }
    } else {
      console.log(`Produto de id ${productId} não encontrado no carrinho.`);
    }
  }
}

export default Cart;
