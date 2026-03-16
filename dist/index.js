"use strict";

var _express = _interopRequireDefault(require("express"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _db = _interopRequireDefault(require("./config/db.js"));
var _aboutRoutes = _interopRequireDefault(require("./routes/about-routes.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var app = (0, _express["default"])();
_dotenv["default"].config();
var PORT = process.env.PORT || 8080;
(0, _db["default"])();
app.use(_express["default"].json());
app.use("/api/about/", _aboutRoutes["default"]);
app.listen(PORT, function () {
  return console.log("Listening to port: ", PORT);
});