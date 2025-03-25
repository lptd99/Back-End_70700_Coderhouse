class Product {
  title;
  description;
  price;
  stock;
  thumbnail;
  code;

  constructor(title, description, price, stock, thumbnail) {
    if (!title || title.length <= 2) {
      throw new Error("Falha ao criar produto. Título inválido: " + title);
    }
    if (!description || description.length <= 4) {
      throw new Error(
        "Falha ao criar produto. Descrição inválida: " + description
      );
    }
    if (price === undefined || price === null || price < 0) {
      throw new Error("Falha ao criar produto. Preço inválido: " + price);
    }
    if (stock === undefined || stock === null || stock < 0) {
      throw new Error("Falha ao criar produto. Estoque inválido: " + stock);
    }
    if (!thumbnail || thumbnail.length <= 4) {
      throw new Error(
        "Falha ao criar produto. Thumbnail inválida: " + thumbnail
      );
    }
    this.title = title;
    this.description = description;
    this.price = price;
    this.stock = stock;
    this.thumbnail = thumbnail;
    this.code = null;
  }

  toString() {
    return (
      "Produto #" +
      this.code +
      ": " +
      this.title +
      " | " +
      this.description +
      " | R$" +
      this.price +
      " | " +
      this.stock +
      " un. | " +
      this.thumbnail
    );
  }
}

module.exports = Product;
