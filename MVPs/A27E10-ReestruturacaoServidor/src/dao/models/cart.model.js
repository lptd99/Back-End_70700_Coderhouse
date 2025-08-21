import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const cartCollection = "carts";
const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
});
cartSchema.plugin(mongoosePaginate);

export const cartModel = mongoose.model(cartCollection, cartSchema);
export default cartModel;
