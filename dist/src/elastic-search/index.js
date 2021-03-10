"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getArticles = exports.createESIndex = exports.elasticSearchClient = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _require = require("@elastic/elasticsearch"),
    Client = _require.Client;

var indexName = "article";
var elasticSearchClient = new Client({
  node: "http://localhost:9200",
  log: "trace",
  requestTimeout: 1000
});
exports.elasticSearchClient = elasticSearchClient;

var createESIndex = function createESIndex() {
  if (!elasticSearchClient) {
    console.log("ES client not initalised");
    return;
  }

  elasticSearchClient.indices.exists({
    index: indexName
  }).then( /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(response) {
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!response) {
                _context.next = 8;
                break;
              }

              if (!(response.statusCode === 404)) {
                _context.next = 7;
                break;
              }

              // index not present , so create it newly
              console.log("Creating index %s ...", indexName);
              _context.next = 5;
              return elasticSearchClient.indices.create({
                index: indexName
              }).then(function (r) {
                console.log("Index created:", indexName);
                return Promise.resolve(r);
              });

            case 5:
              _context.next = 8;
              break;

            case 7:
              console.log("Index ".concat(indexName, " already created"));

            case 8:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }())["catch"](function (err) {
    return console.log(err);
  });
};

exports.createESIndex = createESIndex;

var getArticles = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(id) {
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", elasticSearchClient.search({
              index: indexName,
              body: {
                query: {
                  ids: {
                    values: [id]
                  }
                }
              }
            }).then(function (res) {
              if (res) {
                return res.body.hits.hits;
              }

              return null;
            })["catch"](function (err) {
              return console.log(JSON.stringify(err));
            }));

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function getArticles(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

exports.getArticles = getArticles;