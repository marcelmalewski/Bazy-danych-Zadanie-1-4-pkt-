const { Schema, model } = require("mongoose");

const productSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  state: {
    type: String,
    enum: ["AVAILABLE", "UNAVAILABLE", "WAITING_TO_BE_DELIVERED"],
    default: "AVAILABLE",
  },
});

module.exports = model("Product", productSchema);
