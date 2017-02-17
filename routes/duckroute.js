'use strict';
/*
@file
Duck RESTful API that allows to get Duck sightings, store sightings and update old sightings.
Doesn't have any authentication and doesn't store any user information to DB.
Please see API documentation from README.md

This file is part of homework Vincit Ltd gave me when I was applying for summer job in year 2017.

@author Tuomas Aho <tuomas.aho@outlook.com>
@version 0.0.1

*/

const transaction = require('objection').transaction;
const Promise = require('bluebird');
const Model = require('objection').Model;
const Specie = require('../models/Specie');
const Sighting = require('../models/Sighting');

module.exports = function (app) {

    app.get('/sightings', (req, res) => {
        Sighting
        .query()
        .then(function (sightings) {
            res.json(sightings);
        })
        .catch(function (err) {
            res.status(500).send({error: "Internal Server Error"});
        });
    });


    app.post('/sightings', (req, res) => {
        transaction(Sighting, function (Sighting) {
            // Assume that user doesn't give dateTime with POST request
            let count = null;
            if (req.body.count && !isNaN(req.body.count) && parseInt(req.body.count) > 0 )
            {
                count = parseInt(req.body.count);
            }
            else{
                res.status(400).send({error: "count param not a number or smaller than 1"});
            }
            Specie
            .query()
            .where('name', req.body.species)
            .first()
            .then(function (specie) {
                specie
                .$relatedQuery('sightings')
                .insert({species: req.body.species, description: req.body.description || "",
                count: count})
                .then(function (sighting) {
                    res.json(sighting);
                })
                .catch(function (err) {
                    console.log(err);
                    res.status(400).send({error: "Couldn't find wanted Specie."});
                });
            })
            .catch(function (err) {
                res.status(500).send({error: "Internal Server Error"});
            });
        });
    });


    app.get('/species', (req, res) => {
        Specie
        .query()
        .then(function (species) {
            res.json(species);
        })
        .catch(function (err) {
            res.status(500).send({error: "Internal Server Error"});
        });
    });


    app.get('/sightings/report', (req, res) => {
        Date.prototype.isValid = function() {
            return isFinite(this);
        };
        // Validate 'year', 'month', 'startTime' and 'endTime' parameters
        if ((req.query.month || req.query.year ) && (req.query.startTime || req.query.endTime)){
            res.status(400).send({error: "Cannot give month and startTime or endTime at same time."});
            return;
        }
        let startTime = new Date("1970-01-01T00:00:00Z");
        let endTime = new Date();
        if ('startTime' in req.query || 'endTime' in req.query) {
            startTime = req.query.startTime;
            endTime = req.query.endTime;
            if (!startTime || typeof startTime != "string" || !endTime || typeof  endTime != "string") {
                res.status(400).send({error: "Invalid startTime or endTime."});
                return;
            }
            startTime = new Date(startTime);
            endTime = new Date(endTime);
        }
        if ('month'  in req.query || 'year'  in req.query) {
            let month, year = null;
            year = isNaN(req.query.year) ? null : parseInt(req.query.year);
            month =  isNaN(req.query.month) ? null : parseInt(req.query.month);
            if (!month || !year) {
                res.status(400).send({error: "Invalid year or month."});
                return;
            }
            startTime = new Date(year, month -1, 1, 0, 0, 0, 0);
            endTime = new Date(year, month, 0, 23, 59, 59, 999);
        }
        if (!startTime.isValid() || !endTime.isValid() || endTime < startTime)
        {
            // This should only be possible by with invalid user input.
            res.status(400).send({error: "Invalid startTime or endTime. startTime has to be smaller than endTime"});
            return;
        }

        // Validate 'count' parameter
        let minCount  = req.query.count || 0;
        if (isNaN(minCount)){
            res.status(400).send({error: "Invalid count: not a number"});
            return;
        }

        // Fetch Sightings with Specie relation if user gave 'species' parameter
        if ('species' in req.query){
            Specie
            .query()
            .where('name', req.query.species)
            .first()
            .then(function (specie) {
                specie
                .$relatedQuery('sightings')
                .where('dateTime', '>', startTime)
                .andWhere('dateTime', '<', endTime)
                .andWhere('count', '>', minCount)
                .orderBy('dateTime')
                .then(function (sightings) {
                    res.json(sightings);
                })
                .catch(function (err) {
                    res.status(400).send({error: "Couldn't find any Sightings with given values"});
                });
            })
            .catch(function (err) {
                res.status(400).send({error: "No such Specie in database"});
            });
        }
        // Fetch Sightings without Specie relation. User didn't give 'species' parameter.
        else{
            Sighting
            .query()
            .where('dateTime', '>', startTime)
            .andWhere('dateTime', '<', endTime)
            .andWhere('count', '>', minCount)
            .orderBy('dateTime')
            .then(function (sightings) {
                console.log(sightings);
                res.json(sightings);
            })
            .catch(function (err) {
                res.status(400).send({error: "Couldn't find any Sightings with given values"});
            });
        }
    });

    app.patch('/sightings/:id', (req,res) => {
        let id = req.params.id;
        console.log(req.body);
        if (req.body.count && !isNaN(req.body.count) && parseInt(req.body.count) > 0 )
        {
            req.body.count = parseInt(req.body.count);
        }
        if ("id" in req.params)
        {
            // Don't give user to change Id
            delete req.params.id;
        }
        Sighting
        .query()
        .patch(req.body)
        .where('id', id)
        .then(function (numUpdated) {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send({error: "Couldn't find wanted Specie or unknown values."});
        });
    });

    app.get('/sightings/:id', (req, res) => {
        Sighting
        .query()
        .where('id', req.params.id)
        .first()
        .then(sighting => {
            res.json(sighting);
        })
        .catch(function (err) {
            res.status(500).send({error: "Internal Server Error"});
        });
    });


    app.delete('/sightings/:id', (req, res) => {
        Sighting
        .query()
        .delete()
        .where('id', req.params.id)
        .then(numDeleted => {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(500).send({error: "Internal Server Error"});
        });
    });
};
