'use strict';

/*
@file
Duck RESTful API's Specie model that stores information about single Duck specie.

Please see API documentation from README.md

This file is part of homework Vincit Ltd gave me when I was applying for summer job in year 2017.

@author Tuomas Aho <tuomas.aho@outlook.com>
@version 0.0.1

*/

const Model = require('objection').Model;

class Specie extends Model{
    static get tableName(){
        return 'species';
    }
    static get idColumn(){
        return 'name';
    }
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name'],
            properties: {
                name: {type: 'string', minLength: 1, maxLength: 255}
            }
        }
    }
    static get relationMappings(){
        return {
            sightings: {
                relation: Model.HasManyRelation,
                modelClass: __dirname + '/Sighting',
                join: {
                    to : 'sightings.species',
                    from : 'species.name'
                }
            }
        }
    }
}

module.exports = Specie;
