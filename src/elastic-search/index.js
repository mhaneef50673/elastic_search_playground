const { Client } = require("@elastic/elasticsearch");

const indexName = "article";

const elasticSearchClient = new Client({
  node: "http://localhost:9200",
  log: "trace",
  requestTimeout: 1000,
});

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
            .then((r) => {
              console.log("Index created:", indexName);
              return Promise.resolve(r);
            });
        } else {
          console.log(`Index ${indexName} already created`);
        }
      }
    })
    .catch((err) => console.log(err));
};

const getArticles = async (id) => {
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

export { elasticSearchClient, createESIndex, getArticles };
