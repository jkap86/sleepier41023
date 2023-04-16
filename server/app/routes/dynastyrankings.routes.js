'use strict'

module.exports = app => {
    const dynastyrankings = require("../controllers/dynastyrankings.controller.js");

    var router = require("express").Router();



    router.post("/find", dynastyrankings.find)

    app.use('/dynastyrankings', router);
}