
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const app = express();
const router = require("./routes");

// util functions

import { createESIndex, getArticles, elasticSearchClient } from "./elastic-search";

//add other middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

const context = process.env.CONTEXT || "/api";

// ROUTES START

app.use(context, router);

// ROUTES END

//start app
const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`App is listening on port ${port}.`);

  elasticSearchClient.ping(async (error) => {
    if (error) {
      console.log("elastic search is down");
      return;
    }

    console.log("Elastic search is up and running ");

    // Now that elastic search is up and running check for whether article index is created
    await createESIndex(elasticSearchClient);
  });
});
