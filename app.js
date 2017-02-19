'use strict';
const express = require('express');
const app = require('express');
const Knex = require('knex');
const fs = require('fs');
const Model = require('objection').Model;
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const expressSanitizer = require('express-validator');

module.exports = function (dbConfig) {
    // Initialize knex
    const knex  = Knex(dbConfig);

    // Bind all models to a knex instance
    Model.knex(knex);

    // Configure express
    const app = express()
    .use(bodyParser.json())
    .use(expressSanitizer())
    .use(bodyParser.urlencoded({extended: true}))
    .use(morgan('dev'))
    .set('json spaces', 2);

    // Register routes
    fs.readdir(path.join(__dirname, 'routes'), (err, files) => {
        if (err) {
            console.error('Could not register routes ' + err);
        } else {
            for (let file of files) {
                if (path.extname(file) === '.js') {
                    require(path.join(__dirname, 'routes', file))(app);
                }
            }
        }
    });
    // Error handling
    app.use((err, req, res, next) => {
        if (err) {
            res.status(err.statusCode || err.status || 500).send(err.data || err.message || {});
        } else {
            next();
        }
    });
    return app;
};
