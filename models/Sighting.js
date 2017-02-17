'use strict';

/*
@file
Duck RESTful API's Sighting model that stores infromation about single Duck sighting.

Please see API documentation from README.md

This file is part of homework Vincit Ltd gave me when I was applying for summer job in year 2017.

@author Tuomas Aho <tuomas.aho@outlook.com>
@version 0.0.1

*/



const Model = require('objection').Model;

class Sighting extends Model{
    static get tableName(){
        return 'sightings';
    }
    static get idColumn(){
        return 'id';
    }
    static get jsonSchema(){
        return {
            type: 'object',
            required: ['species', 'count'],
            properties: {
                id: {type: 'integer'},
                count: {type: 'integer'},
                species: {type: 'string', minLength: 1, maxLength: 255},
                dateTime: {type: 'string'},
                description: {type: 'string', minLength: 0, maxLength: 1024}
            }
        }
    }
}

Sighting.prototype.$beforeInsert = function () {
    this.dateTime = new Date().toISOString();
};

Sighting.prototype.$beforeUpdate = function () {
    this.dateTime = new Date().toISOString();
};

module.exports = Sighting;
