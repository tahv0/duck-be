/*
    @file
    Migration file for Duck RESTful API.

    Please see how to use this from README.md.
    Remember to run migrations before using Population and starting server.

    This file is part of homework Vincit Ltd gave me when I was applying for summer job in year 2017.

    @author Tuomas Aho <tuomas.aho@outlook.com>
    @version 0.0.1

*/

CREATE TABLE Species(
    name varchar(255) NOT NULL PRIMARY KEY
);

CREATE TABLE Sightings(
    id serial NOT NULL PRIMARY KEY,
    species varchar(255) NOT NULL REFERENCES Species(name),
    description varchar(1024),
    "dateTime" timestamp NOT NULL  default current_timestamp,
    count integer NOT NULL
);