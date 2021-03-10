"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _elasticSearch = require("../elastic-search");

var express = require("express");

var router = express.Router();
// Home page route.
router.get("/", function (req, res) {
  res.send("API is up and running");
}); // About page route.

router.get("/content", /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var id, response;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            id = req.query.id;
            response = {};

            if (!id) {
              _context.next = 7;
              break;
            }

            _context.next = 5;
            return (0, _elasticSearch.getArticles)(id).then(function (response) {
              response = {
                data: response || [],
                success: true,
                error: null
              };
              res.json(response);
            })["catch"](function (err) {
              console.log("error while retreiving articles with ".concat(id), err);
              res.json({
                data: [],
                error: "Id is requried",
                success: false
              });
              res.json(response);
            });

          case 5:
            _context.next = 9;
            break;

          case 7:
            response = {
              data: [],
              error: "Id is requried",
              success: false
            };
            res.json(response);

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
module.exports = router;