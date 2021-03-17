var express = require("express");
var router = express.Router();

import { isEmpty } from "lodash";

import {
  getArticleById,
  getAllArticles,
  deleteArticleByID,
  addArticle,
  updateArticle,
} from "../elastic-search";

// default route.
router.get("/", function (req, res) {
  res.send("API is up and running");
});

// content route.
router.get("/content", async (req, res) => {
  const { id } = req.query;
  let response = {};
  if (id) {
    await getArticleById(id)
      .then((resp) => {
        let data = [];
        if (!isEmpty(resp)) {
          data = resp.map((cat) => {
            return { id: cat._id, ...cat._source };
          });
        }
        response = {
          data,
          success: true,
          message: "Article fetched successfully",
          error: null,
        };
        res.json(response);
      })
      .catch((err) => {
        console.log(`error while retreiving articles with ${id}`, err);
        res.json({
          data: null,
          message: `Error while fetching article ${JSON.stringify(err)}`,
          success: false,
        });
      });
  } else {
    response = {
      data: null,
      message: "Error while fetching article, ID is required parameter",
      success: false,
    };
    res.json(response);
  }
});

// Get all article content route
router.get("/allcontent", async (req, res) => {
  let response = {};
  await getAllArticles()
    .then((resp) => {
      let data = [];
      if (!isEmpty(resp)) {
        data = resp.map((ar) => {
          return { id: ar._id, ...ar._source };
        });
      }
      response = {
        data: data,
        success: true,
        message: "Articles fetched successfully",
      };
      res.json(response);
    })
    .catch((err) => {
      console.log(`error while retreiving articles`, err);
      res.json({
        data: null,
        message: `error while fetching all articles, ${JSON.stringify(err)}`,
        success: false,
      });
    });
});

// Delete article by id route
router.delete("/deletearticle", async (req, res) => {
  const reqBody = req.body;
  const { id } = reqBody;
  let response = {};
  if (id) {
    await deleteArticleByID(id)
      .then((response) => {
        if (response) {
          response = {
            success: true,
            message: "Article deleted successfully",
          };
        } else {
          response = {
            success: false,
            message: "Article doesnt exists",
          };
        }
        res.json(response);
      })
      .catch((err) => {
        console.log(`error while retreiving articles with ${id}`, err);
        res.json({
          message: `Error while deleting the article ${err}`,
          success: false,
        });
      });
  } else {
    response = {
      message: "Error while deleting article, ID is required parameter",
      success: false,
    };
    res.json(response);
  }
});

// Add article route
router.put("/addarticle", async (req, res) => {
  const reqBody = req.body;
  let response = {};
  if (!isEmpty(reqBody)) {
    const publishedDate = new Date();
    reqBody.publishedDate = publishedDate;
    reqBody.updatedAt = publishedDate;
    await addArticle(reqBody)
      .then((resp) => {
        response = {
          success: true,
          message: "Article created successfully",
        };
        res.json(response);
      })
      .catch((err) => {
        console.log(`error while adding articles`, err);
        res.json({
          message: `Error while adding article ${JSON.stringify(err)}`,
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

// Update article
router.post("/updatearticle", async (req, res) => {
  const reqBody = req.body;
  let response = {};
  if (!isEmpty(reqBody) && reqBody.id) {
    const { id, data } = reqBody;
    const updatedDate = new Date();
    data.updatedAt = updatedDate;
    await updateArticle(id, data)
      .then((resp) => {
        response = {
          success: true,
          message: "Article updated successfully",
        };
        res.json(response);
      })
      .catch((err) => {
        console.log(`error while updating articles`, err);
        res.json({
          message: `Error while updating article ${JSON.stringify(err)}`,
          success: false,
        });
      });
  } else {
    res.status = 500;
    response = {
      message: "id and data is required",
      success: false,
    };
    res.json(response);
  }
});
module.exports = router;
