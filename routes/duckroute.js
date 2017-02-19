"use strict";
/*
@file
Duck RESTful API that allows to get Duck sightings, store sightings and update old sightings.
Doesn't have any authentication and doesn't store any user information to DB.
Please see API documentation from README.md

Uses express-validator because I don't know if Objection or Knex does any validation (didn't find anything
from documentations).


This file is part of homework Vincit Ltd gave me when I was applying for summer job in year 2017.

@author Tuomas Aho <tuomas.aho@outlook.com>
@version 1.0.1

*/

const transaction = require('objection').transaction;
const util = require('util');
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
            req.checkBody('species').notEmpty().isAlpha();
            req.checkBody('count').notEmpty().isInt();
            req.sanitizeBody('description').escape();
            if ('dateTime' in req.body){
                req.checkBody('dateTime').isISO8601();
            }

            req.getValidationResult().then(function(result) {
                if (!result.isEmpty()) {
                    res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
                    return;
                }
                let count = null;
                if (parseInt(req.body.count) > 0 )
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
                    count: count, dateTime: req.body.dateTime || new Date().toISOString()})
                    .then(function (sighting) {
                        res.json(sighting);
                    })
                    .catch(function (err) {
                        res.status(400).send({error: "Couldn't create Sightings for this Specie"});
                    });
                })
                .catch(function (err) {
                    res.status(500).send({error: "Couldn't find Specie"});
                });
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
        // Init startTime and endTime because these query parameters are optional.
        // startTime to far back in time and endTime to this moment in time.
        let startTime = new Date("1970-01-01T00:00:00Z");
        let endTime = new Date();
        if ('startTime' in req.query || 'endTime' in req.query) {

            req.checkQuery('startTime').notEmpty().isISO8601();
            req.checkQuery('endTime').notEmpty().isISO8601();
            startTime = new Date(req.query.startTime);
            endTime = new Date(req.query.endTime);
        }
        else if ('month' in req.query || 'year' in req.query){
            req.checkQuery('month').notEmpty().isInt();
            req.checkQuery('year').notEmpty().isInt();
            startTime = new Date(parseInt(req.query.year), parseInt(req.query.month) -1, 1, 0, 0, 0, 0);
            endTime = new Date(parseInt(req.query.year), parseInt(req.query.month), 0, 23, 59, 59, 999);
        }
        if (!startTime.isValid() || !endTime.isValid() || endTime < startTime)
        {
            // This should only be possible by with invalid user input.
            res.status(400).send({error: "startTime has to be smaller than endTime"});
            return;
        }
        req.getValidationResult().then(function(result) {
            if (!result.isEmpty()) {
                res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
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
                    .where('dateTime', '>=', startTime)
                    .andWhere('dateTime', '<=', endTime)
                    .andWhere('count', '>=', minCount)
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
                .where('dateTime', '>=', startTime)
                .andWhere('dateTime', '<=', endTime)
                .andWhere('count', '>=', minCount)
                .orderBy('dateTime')
                .then(function (sightings) {
                    res.json(sightings);
                })
                .catch(function (err) {
                    res.status(400).send({error: "Couldn't find any Sightings with given values"});
                });
            }
        });
    });


    app.patch('/sightings/:id', (req,res) => {

        req.checkParams('id').isInt();
        req.checkBody('species').notEmpty().isAlpha();
        req.checkBody('count').notEmpty().isInt();
        req.sanitizeBody('description').escape();

        if ('dateTime' in req.body){
            req.checkBody('dateTime').isISO8601();
        }

        req.getValidationResult().then(function(result) {
            if (!result.isEmpty()) {
                res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
                return;
            }

            let id = req.params.id;
            let count = null;
            if (req.body.count && !isNaN(req.body.count) && parseInt(req.body.count) > 0 )
            {
                count = parseInt(req.body.count);

            }
            let patchValues = {
                species: req.body.species,
                description: req.body.description || "",
                count: count,
                dateTime: req.body.dateTime
            };
            if (!'dateTime' in req.body){
                delete patchValues['dateTime'];
            }
            if (count == null)
            {
                delete patchValues['count'];
            }
            Sighting
            .query()
            .patch(patchValues)
            .where('id', id)
            .then(function (numUpdated) {
                res.sendStatus(200);
            })
            .catch(function (err) {
                res.status(400).send({error: "Couldn't find wanted Specie or unknown values."});
            });
        });
    });


    app.get('/sightings/:id', (req, res) => {

        req.checkParams('id').isInt();

        req.getValidationResult().then(function(result) {
            if (!result.isEmpty()) {
                res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
                return;
            }

            Sighting
            .query()
            .where('id', req.params.id)
            .first()
            .then(sighting => {
                if (!sighting){
                    res.status(400).send({error: "No Sightings with id " + req.params.id.toString()});
                }
                else{
                    res.json(sighting);
                }
            });
        });
    });


    app.delete('/sightings/:id', (req, res) => {
        req.checkParams('id').isInt();

        req.getValidationResult().then(function(result) {
            if (!result.isEmpty()) {
                res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
                return;
            }

            Sighting
            .query()
            .delete()
            .where('id', req.params.id)
            .then(numDeleted => {
                if (numDeleted == 0){
                    res.status(400).send({error: "No Sightings with id " + req.params.id.toString()});
                }
                else{
                    res.sendStatus(200);
                }
            });
        });
    });
};
