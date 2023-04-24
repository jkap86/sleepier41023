'use strict'

module.exports = app => {
    const users = require("../controllers/user.controller.js");

    var router = require("express").Router();

    router.use((req, res, next) => {
        req.app = app
        next()
    });

    router.post("/create", users.create)

    users.findMostLeagues(app)

    router.post("/findmostleagues", (req, res) => {
        res.send(app.get('top_users'))
    })

    app.use('/user', router);
}