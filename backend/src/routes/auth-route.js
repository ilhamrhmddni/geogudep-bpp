const express = require("express");
const route = express.Router();
const { login, logout } = require("../controllers/auth-controller");

// Login
route.post("/login", login);

// Logout
route.post("/logout", logout);

module.exports = route;
