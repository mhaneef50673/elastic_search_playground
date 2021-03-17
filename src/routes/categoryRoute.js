var express = require("express");
var categoryRouter = express.Router();

import { isEmpty } from "lodash";

import {
  getAllCategories,
  addCategory,
  updateCategoriesOrder,
} from "../elastic-search";

// get category route.
categoryRouter.get("/categories", async (req, res) => {
  let response = {};
  await getAllCategories()
    .then((resp) => {
      let data = [];
      if (!isEmpty(resp)) {
        data = resp.map((cat) => {
          return { id: cat._id, ...cat._source };
        });
      }
      response = {
        data: data,
        success: true,
        message: "Categories fetched successfully",
      };
      res.json(response);
    })
    .catch((err) => {
      console.log(`error while retreiving categories`, err);
      res.json({
        data: null,
        message: `error while fetching all categories, ${JSON.stringify(err)}`,
        success: false,
      });
    });
});

module.exports = categoryRouter;

categoryRouter.put("/addcategory", async (req, res) => {
  const reqBody = req.body;
  let response = {};
  if (!isEmpty(reqBody)) {
    await addCategory(reqBody)
      .then((resp) => {
        response = {
          success: true,
          message: "Category created successfully",
        };
        res.json(response);
      })
      .catch((err) => {
        console.log(`error while adding category`, err);
        res.json({
          message: `Error while adding category ${JSON.stringify(err)}`,
          success: false,
        });
      });
  } else {
    res.status = 500;
    response = {
      message: "Empty request not allowed",
      success: false,
    };
    res.json(response);
  }
});

categoryRouter.post("/updateCategoriesOrder", async (req, res) => {
  let response = {};
  await updateCategoriesOrder()
    .then((resp) => {
      console.log("resp", JSON.stringify(resp));
      response = {
        success: true,
        message: "category order updated successfully",
      };
      res.json(response);
    })
    .catch((err) => {
      console.log(`error while updating category order`, err);
      res.json({
        message: `Error while updating category order`,
        success: false,
      });
    });
});
