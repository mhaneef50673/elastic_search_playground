import e from "express";

const { Client } = require("@elastic/elasticsearch");

const indexName = "article";

const elasticSearchClient = new Client({
  node: "http://localhost:9200",
  log: "trace",
  requestTimeout: 1000,
});

/**
 * Create elastic search index if it doesnt exists
 */
const createESIndex = () => {
  if (!elasticSearchClient) {
    console.log("ES client not initalised");
    return;
  }

  elasticSearchClient.indices
    .exists({ index: indexName })
    .then(async (response) => {
      if (response) {
        if (response.statusCode === 404) {
          // index not present , so create it newly
          console.log("Creating index %s ...", indexName);
          await elasticSearchClient.indices
            .create({ index: indexName })
            .then(async (r) => {
              console.log("Index created:", indexName);

              // now create article field mapping
              await createMapping();
              return Promise.resolve(r);
            });
        } else {
          console.log(`Index ${indexName} already created`);
        }
      }
    })
    .catch((err) => console.log(err));
};

const createMapping = () => {
  return elasticSearchClient.indices
    .putMapping({
      index: indexName,
      body: {
        properties: {
          article_type: {
            type: "text",
          },
          body_html_ar: {
            type: "text",
          },
          body_html_en: {
            type: "text",
          },
          categories_ar: {
            type: "text",
          },
          categories_en: {
            type: "text",
          },
          mainImageUrl: {
            type: "text",
          },
          publishedDate: {
            type: "date",
          },
          updatedAt: {
            type: "date",
          },
          title_ar: {
            type: "text",
          },
          templateNumber: {
            type: "long",
          },
        },
      },
    })
    .then((response, error) => {
      if (error) {
        console.log("error while creating field mapping", error);
      }

      if (response) {
        console.log("Mapping created sucessfully");
      }
    })
    .catch((error) => console.log("error while creating field mapping", error));
};

/**
 * Get Article by ID
 * @param {*} id
 * @returns {*} response object
 */
const getArticleById = async (id) => {
  return elasticSearchClient
    .search({
      index: indexName,
      body: {
        query: {
          ids: {
            values: [id],
          },
        },
      },
    })
    .then((res) => {
      if (res) {
        return res.body.hits.hits;
      }

      return null;
    })
    .catch((err) => console.log(JSON.stringify(err)));
};

/**
 * Get All Articles
 * @returns array of articles
 */
const getAllArticles = async () => {
  return elasticSearchClient
    .search({
      index: indexName,
      body: {
        query: { match_all: {} },
      },
    })
    .then((res) => {
      if (res) {
        return res.body.hits.hits;
      }
      return null;
    })
    .catch((err) => err);
};

/**
 * Delete an article by ID
 * @param {*} id of the article to be deleted
 * @returns response object
 */

const deleteArticleByID = async (id) => {
  return elasticSearchClient
    .deleteByQuery({
      index: indexName,
      body: {
        query: {
          ids: {
            values: [id],
          },
        },
      },
    })
    .then((res) => {
      if (res) {
        return res.body.deleted === 1;
      }

      return false;
    })
    .catch((err) => console.log(JSON.stringify(err)));
};

/**
 * Add article to index
 * @param {*} articleData article data that needs to be indexed
 */
const addArticle = async (articleData) => {
  return elasticSearchClient
    .index({
      index: indexName,
      body: {
        ...articleData,
      },
    })
    .then((response) => response)
    .catch((err) => err);
};

/**
 * update the article by ID
 * @param {*} id article id
 * @param {*} articleData article data
 */
const updateArticle = async (id, articleData) => {
  return elasticSearchClient
    .updateByQuery({
      index: indexName,
      refresh: true,
      body: {
        script: {
          lang: "painless",
          inline:
            "ctx._source.article_type = params.article_type; ctx._source.body_html_ar = params.body_html_ar; ctx._source.body_html_en = params.body_html_en; ctx._source.categories_ar = params.categories_ar; ctx._source.categories_en = params.categories_en; ctx._source.mainImageUrl = params.mainImageUrl; ctx._source.title_ar = params.title_ar; ctx._source.templateNumber = params.templateNumber; ctx._source.publishedDate = params.publishedDate; ctx._source.updatedAt = params.updatedAt",
          params: {
            article_type: articleData.article_type,
            body_html_ar: articleData.body_html_ar,
            body_html_en: articleData.body_html_en,
            categories_ar: articleData.categories_ar,
            categories_en: articleData.categories_en,
            mainImageUrl: articleData.mainImageUrl,
            title_ar: articleData.title_ar,
            templateNumber: articleData.templateNumber,
            publishedDate: articleData.publishedDate,
            updatedAt: articleData.updatedAt,
          },
        },
        query: {
          ids: {
            values: [id],
          },
        },
      },
    })
    .then((response) => response)
    .catch((err) => err);
};

export {
  elasticSearchClient,
  createESIndex,
  getArticleById,
  getAllArticles,
  deleteArticleByID,
  addArticle,
  updateArticle,
};
