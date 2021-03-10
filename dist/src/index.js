"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _elasticSearch = require("./elastic-search");

var express = require("express");

var cors = require("cors");

var bodyParser = require("body-parser");

var morgan = require("morgan");

var app = express();

var router = require("./routes"); // util functions


//add other middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(morgan("dev"));
var context = process.env.CONTEXT || "/api"; // ROUTES START

app.use(context, router); // ROUTES END
//start app

var port = process.env.PORT || 3001;
app.listen(port, function () {
  console.log("App is listening on port ".concat(port, "."));

  _elasticSearch.elasticSearchClient.ping( /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(error) {
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!error) {
                _context.next = 3;
                break;
              }

              console.log("elastic search is down");
              return _context.abrupt("return");

            case 3:
              console.log("Elastic search is up and running "); // Now that elastic search is up and running check for whether article index is created

              _context.next = 6;
              return (0, _elasticSearch.createESIndex)(_elasticSearch.elasticSearchClient);

            case 6:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
});