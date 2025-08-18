import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const userCollection = "users";
const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  birth: {
    type: Date,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
});
userSchema.plugin(mongoosePaginate);

export const userModel = mongoose.model(userCollection, userSchema);
export default userModel;
