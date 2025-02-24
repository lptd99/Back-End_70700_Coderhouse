const aux = require("./auxiliaryFunctions.js");

let lastId = 0;
const UPDATE_SUCCESS = `Produto #ID atualizado com sucesso.`;

class Product {
  constructor(title, description, price, thumbnail, stock) {
    const validation = aux.validateProduct({
      title,
      description,
      price,
      thumbnail,
      stock,
    });
    if (Object.values(validation).every((v) => v)) {
      this.id = ++lastId;
      this.title = title;
      this.description = description;
      this.price = price;
      this.thumbnail = thumbnail;
      this.stock = stock;
      console.log(`Produto #${this.id} criado com sucesso.`);
    } else {
      throw new Error(
        `[ERROR] Invalid product data: ${JSON.stringify(validation)}`
      );
    }
  }

  toString() {
    return `Product #${this.id}:
    Title: ${this.title}
    Description: ${this.description}
    Price: $${this.price}
    Thumbnail: ${this.thumbnail}
    Stock: ${this.stock}`;
  }

  updateField(field, value) {
    if (aux.validateField(field, value)) {
      this[field] = value;
      console.log(UPDATE_SUCCESS.replace("#ID", `#${this.id}`));
      return true;
    } else {
      console.log(`Invalid field or value.`);
      return false;
    }
  }

  updateFields(title, description, price, thumbnail, stock) {
    if (aux.validateProduct({ title, description, price, thumbnail, stock })) {
      this.title = title;
      this.description = description;
      this.price = price;
      this.thumbnail = thumbnail;
      this.stock = stock;
      console.log(UPDATE_SUCCESS);
    } else {
      console.log(`Invalid product data.`);
    }
  }

  updateProduct(product) {
    try {
      const id = this.id;
      for (const key in product) {
        if (key === "id") {
          continue;
        }
        if (this.hasOwnProperty(key) && aux.validateField(key, product[key])) {
          this[key] = product[key];
        } else {
          throw new Error(`[ERROR] Invalid field or value.`);
        }
      }
      this.id = id;
      console.log(UPDATE_SUCCESS.replace("#ID", `#${this.id}`));
    } catch {
      console.log(`[ERROR] Invalid product data: ${JSON.stringify(product)}`);
      return false;
    }
  }

  show() {
    console.log(this.toString());
  }
}

module.exports = Product;
