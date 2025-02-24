let debug = false;
let logs = 0;
let dos = 0;

const dLog = (text) => {
  if (debug) {
    console.log(`[DEBUG]: [log ${logs}]`, text);
    logs++;
  }
};

const dDo = (callback) => {
  if (debug) {
    dLog(`[do ${dos}] Doing "${callback.name}"...`);
    callback();
    dLog(`[do ${dos}] "${callback.name}" Done.`);
    dos++;
  }
};

// REGRAS DE NEGOCIO
const [minTitle, maxTitle] = [4, 128];
const [minDescription, maxDescription] = [1, 1024];
const [minPrice, maxPrice] = [0, 999999];
const [minThumbnail, maxThumbnail] = [1, 256];
const [minStock, maxStock] = [0, 999];

function validateTitle(title) {
  return (
    title &&
    typeof title === "string" &&
    title.length > minTitle &&
    title.length < maxTitle
  );
}

function validateDescription(description) {
  return (
    description &&
    typeof description === "string" &&
    description.length > minDescription &&
    description.length < maxDescription
  );
}

function validatePrice(price) {
  return (
    price && typeof price === "number" && price > minPrice && price < maxPrice
  );
}

function validateThumbnail(thumbnail) {
  return (
    thumbnail &&
    typeof thumbnail === "string" &&
    thumbnail.length > minThumbnail &&
    thumbnail.length < maxThumbnail
  );
}

function validateStock(stock) {
  return (
    stock && typeof stock === "number" && stock > minStock && stock < maxStock
  );
}

function validateProduct(product) {
  return {
    title: validateTitle(product.title),
    description: validateDescription(product.description),
    price: validatePrice(product.price),
    thumbnail: validateThumbnail(product.thumbnail),
    stock: validateStock(product.stock),
  };
}

function validateField(field, value) {
  switch (field) {
    case "title":
      return validateTitle(value);
    case "description":
      return validateDescription(value);
    case "price":
      return validatePrice(value);
    case "thumbnail":
      return validateThumbnail(value);
    case "stock":
      return validateStock(value);
    default:
      return false;
  }
}

const aux = {
  dLog,
  dDo,
  validateTitle,
  validateDescription,
  validatePrice,
  validateThumbnail,
  validateStock,
  validateProduct,
  validateField,
};

module.exports = aux;
