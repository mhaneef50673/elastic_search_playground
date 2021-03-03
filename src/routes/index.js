var express = require("express");
var router = express.Router();

import { getArticles } from "../elastic-search";

// Home page route.
router.get("/", function (req, res) {
  res.send("API is up and running");
});

// About page route.
router.get("/content", async (req, res) => {
  const { id } = req.query;
  let response = {};
  if (id) {
    await getArticles(id)
      .then((response) => {
        response = {
          data: response || [],
          success: true,
          error: null,
        };
        res.json(response);
      })
      .catch((err) => {
        console.log(`error while retreiving articles with ${id}`, err);
        res.json({
          data: [],
          error: "Id is requried",
          success: false,
        });

        res.json(response);
      });
  } else {
    response = {
      data: [],
      error: "Id is requried",
      success: false,
    };
    res.json(response);
  }
});

module.exports = router;
