import { CATEGORY_INDEX_NAME, ARTICLE_INDEX_NAME } from "../constants";

const { Client } = require("@elastic/elasticsearch");

const defaultIndexName = ARTICLE_INDEX_NAME;

const elasticSearchClient = new Client({
  node: "http://localhost:9200",
  log: "trace",
  requestTimeout: 1000,
});

/**
 * Create elastic search index if it doesnt exists
 */
const createESIndex = (customIndexName) => {
  const indexName = customIndexName || defaultIndexName;
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

              if (indexName === ARTICLE_INDEX_NAME) {
                // now create article field mapping
                await createArticleMapping(indexName);
              } else if (indexName === CATEGORY_INDEX_NAME) {
                await createCategoryMapping(indexName);
              }
              return Promise.resolve(r);
            });
        } else {
          console.log(`Index ${indexName} already created`);
        }
      }
    })
    .catch((err) => console.log(err));
};

const createIndexMapping = (indexName, mappingBody) => {
  return elasticSearchClient.indices
    .putMapping({
      index: indexName,
      body: {
        ...mappingBody,
      },
    })
    .then((response, error) => {
      if (error) {
        console.log(
          `error while creating field mapping for index ${indexName}`,
          error
        );
      }

      if (response) {
        console.log(`Mapping created sucessfully for index ${indexName}`);
      }
    })
    .catch((error) => console.log("error while creating field mapping", error));
};

const createArticleMapping = (indexName) => {
  return createIndexMapping(indexName, {
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
  });
};

const createCategoryMapping = (indexName) => {
  return createIndexMapping(indexName, {
    properties: {
      name: {
        properties: {
          ar: { type: "text" },
          en: { type: "text" },
        },
      },
      showInMenu: { type: "boolean" },
      slug: { type: "text" },
      order: { type: "long" },
    },
  });
};

/**
 * Get Article by ID
 * @param {*} id
 * @returns {*} response object
 */
const getArticleById = async (id) => {
  return elasticSearchClient
    .search({
      index: defaultIndexName,
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
      index: defaultIndexName,
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
      index: defaultIndexName,
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
      index: defaultIndexName,
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
      index: defaultIndexName,
      refresh: true,
      body: {
        script: {
          lang: "painless",
          source: "ctx._source = params",
          params: {
            ...articleData,
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

/**
 * Get All Categories
 * @returns array of categories
 */
const getAllCategories = async () => {
  return elasticSearchClient
    .search({
      index: CATEGORY_INDEX_NAME,
      body: {
        query: { match_all: {} },
        sort: [{ order: { order: "asc" } }],
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
 * Add new Category
 * @param {*} cateogoryData
 * @returns
 */
const addCategory = async (cateogoryData) => {
  return elasticSearchClient
    .search({
      index: CATEGORY_INDEX_NAME,
      body: {
        query: {
          match_all: {},
        },
        sort: [{ order: { order: "asc" } }],
      },
    })
    .then((resp) => {
      if (resp) {
        const categories = resp.body.hits.hits || [];
        const lastCat =
          categories && categories.length > 0
            ? categories[categories.length - 1]
            : null;
        let order = 0;
        if (lastCat) {
          order = lastCat._source.order + 1;
        }
        const data = { ...cateogoryData, order };
        console.log("data is ", data);
        return elasticSearchClient
          .index({
            index: CATEGORY_INDEX_NAME,
            body: {
              ...data,
            },
          })
          .then((response) => response)
          .catch((err) => err);
      }
    });
};

/**
 * Updates category order field incremently
 * @returns boolean
 */
const updateCategoriesOrder = async () => {
  return elasticSearchClient
    .search({
      index: CATEGORY_INDEX_NAME,
      body: {
        query: { match_all: {} },
      },
    })
    .then((res) => {
      if (res) {
        const categories = res.body.hits.hits || [];
        categories.map(async (category, index) => {
          await elasticSearchClient.updateByQuery({
            index: CATEGORY_INDEX_NAME,
            refresh: true,
            body: {
              script: {
                lang: "painless",
                source: "ctx._source.order = params.order",
                params: {
                  order: index + 1,
                },
              },
              query: {
                ids: {
                  values: [category._id],
                },
              },
            },
          });
        });
        return true;
      } else {
        return false;
      }
    })
    .catch((err) => {
      console.log("error while updating category order", err);
      return false;
    });
};

/**
 * Delete category by ID
 * @param {*} id category id to be deleted
 * @returns
 */
const deleteCategoryById = async (id) => {
  return elasticSearchClient
    .deleteByQuery({
      index: CATEGORY_INDEX_NAME,
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

export {
  elasticSearchClient,
  createESIndex,
  getArticleById,
  getAllArticles,
  deleteArticleByID,
  addArticle,
  updateArticle,
  getAllCategories,
  addCategory,
  updateCategoriesOrder,
  deleteCategoryById,
};
