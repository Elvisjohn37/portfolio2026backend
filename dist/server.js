"use strict";

var _express = _interopRequireDefault(require("express"));
var _cors = _interopRequireDefault(require("cors"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var app = (0, _express["default"])();
app.use((0, _cors["default"])());
app.get("/", function (_req, res) {
  return res.json({
    message: "Hello"
  });
});
app.listen(8080, function () {
  console.log("Listening to port: ", 8080);
});