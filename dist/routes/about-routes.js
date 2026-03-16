"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = require("express");
var _aboutControllers = require("../controllers/about-controllers.js");
var router = (0, _express.Router)();
router.get("/:id", _aboutControllers.getName);
var _default = exports["default"] = router;