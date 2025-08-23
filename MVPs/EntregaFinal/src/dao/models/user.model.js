import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const userCollection = "users";
const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, default: "" }, // <— NÃO required
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, default: "" }, // <— NÃO required
    birth: { type: String, default: "" }, // <— NÃO required (use Date se preferir)
    role: { type: String, default: "user" },

    // Suporte a OAuth:
    provider: { type: String, default: "local", index: true }, // 'local' | 'github' | ...
    providerId: { type: String, default: "", index: true }, // id do provedor
  },
  { timestamps: true }
);
UserSchema.plugin(mongoosePaginate);

export const userModel = mongoose.model(userCollection, UserSchema);
export default userModel;
