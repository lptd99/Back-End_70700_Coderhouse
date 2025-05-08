class Product {
  title;
  description;
  price;
  stock;
  thumbnail;
  code;
  category;
  status;

  constructor(title, description, price, stock, thumbnail, category, status) {
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
    if (!category || category.length <= 2) {
      throw new Error(
        "Falha ao criar produto. Categoria inválida: " + category
      );
    }
    if (
      status === undefined ||
      status === null ||
      (status !== true && status !== false)
    ) {
      throw new Error("Falha ao criar produto. Status inválido: " + status);
    }
    this.title = title;
    this.description = description;
    this.price = price;
    this.stock = stock;
    this.thumbnail = thumbnail;
    this.category = category;
    this.code = null;
    this.status = status; // Default value
  }

  toString() {
    return (
      "Produto #" +
      this.code +
      ": " +
      this.title +
      " | Description: " +
      this.description +
      " | R$" +
      this.price +
      " | In Stock: " +
      this.stock +
      " un. " +
      (this.thumbnail ? ` | Thumbnail: ${this.thumbnail}` : "") +
      " | Categoria: " +
      this.category +
      " | Status: " +
      (this.status ? "Ativo" : "Inativo")
    );
  }
}

export default Product;
