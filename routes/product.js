const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

router.get("/", async (req, res) => {
  try {
    let filterByQuery = {};
    let sortByQuery = {};
    const filterBy = req.query.filterBy;
    const filterValue = req.query.filterValue;
    const sortBy = req.query.sortBy;
    const sortDirection = req.query.sortDirection;

    if (filterBy === "name") {
      filterByQuery.name = filterValue;
    }

    if (filterBy === "price") {
      filterByQuery.price = parseFloat(filterValue);
    }

    if (filterBy === "quantity") {
      filterByQuery.quantity = filterValue;
    }

    if (sortBy === "name") {
      sortByQuery.name = sortDirection;
    }

    if (sortBy === "price") {
      sortByQuery.price = sortDirection;
    }

    if (sortBy === "quantity") {
      sortByQuery.quantity = sortDirection;
    }

    const products = await Product.find(filterByQuery).sort(sortByQuery);
    return res.json({ products });
  } catch (err) {
    return handleCode500(err, res);
  }
});

router.get("/report", async (req, res) => {
  try {
    const productsReport = await Product.aggregate([
      {
        $project: {
          _id: 0,
          name: 1,
          quantity: 1,
          total_price: { $round : [{ $multiply: ["$price", "$quantity"] }, 2] },
        },
      },
    ]);
    return res.json({ productsReport });
  } catch (err) {
    return handleCode500(err, res);
  }
});

router.post("", async (req, res) => {
  try {
    if (req.body.name === undefined)
      return res.status(400).send({ message: "Name is required" });

    if (req.body.price === undefined)
      return res.status(400).send({ message: "Price is required" });

    if (req.body.quantity === undefined)
      return res.status(400).send({ message: "Quantity is required" });

    if (req.body.description === undefined)
      return res.status(400).send({ message: "Description is required" });

    if (req.body.state === undefined)
      return res.status(400).send({ message: "State is required" });

    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      quantity: req.body.quantity,
      state: req.body.state,
    });
    const createdProduct = await Product.create(product);

    return res.status(201).json({ createdProduct });
  } catch (err) {
    if (err.code === 11000)
      return res
        .status(400)
        .send({ message: "Product with this name already exists" });

    if (err.name === "ValidationError") {
      return res.status(400).send({ message: err.message });
    }

    return handleCode500(err, res);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const newValues = {};

    if (req.body.name) newValues.name = req.body.name;
    if (req.body.price) newValues.price = req.body.price;
    if (req.body.description) newValues.description = req.body.description;
    if (req.body.quantity) newValues.quantity = req.body.quantity;
    if (req.body.state) newValues.state = req.body.state;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      newValues,
      { new: true }
    );

    if (updatedProduct) {
      return res.json({ updatedProduct });
    }

    return res.status(400).send({ message: "Product not found" });
  } catch (err) {
    return handleCode500(err, res);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      if (product.state === "WAITING_TO_BE_DELIVERED")
        return res.status(400).send({
          message:
            "Product with state: 'WAITING_TO_BE_DELIVERED' can not be deleted.",
        });

      const deletedProduct = await Product.findByIdAndDelete(req.params.id);

      return res.json({ deletedProduct });
    }

    return res.status(400).send({ message: "Product not found" });
  } catch (err) {
    return handleCode500(err, res);
  }
});

const handleCode500 = (err, res) => {
  return res.status(500).send({ error: err.message });
};

module.exports = router;
