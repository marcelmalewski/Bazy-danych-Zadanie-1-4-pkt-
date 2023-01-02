const express = require("express");
const router = express.Router();
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectID;

router.route("/record").get(function (req, res) {
  let db_connect = dbo.getDb("products");
  db_connect
    .collection("records")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});

router.route("/record/:id").get(function (req, res) {
  let db_connect = dbo.getDb("products");
  let myquery = { _id: ObjectId(req.params.id) };
  db_connect.collection("records");
});

router.route("/record/add").post(function (req, res) {
  let db_connect = dbo.getDb("products");
  let myobj = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
  };
  db_connect.collection("records").insertOne(myobj, function (err, result) {
    if (err) throw err;
    res.json(result);
  });
});

module.exports = router;
