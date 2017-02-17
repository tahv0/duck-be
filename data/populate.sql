/*
    @file
    Population file for Duck RESTful API.

    Stores same initial data than in Jaakko Ylinen's implementatio:
    https://github.com/jaakkoyl/duck-be

    Please see how to use this from README.md

    This file is part of homework Vincit Ltd gave me when I was applying for summer job in year 2017.

    @author Tuomas Aho <tuomas.aho@outlook.com>
    @version 0.0.1

*/
INSERT INTO Species (name) VALUES ('mallard');
INSERT INTO Species (name) VALUES ('redhead');
INSERT INTO Species (name) VALUES ('gadwall');
INSERT INTO Species (name) VALUES ('canvasback');
INSERT INTO Species (name) VALUES ('lesser scaup');


INSERT INTO Sightings (species, description, "dateTime", count) VALUES ('gadwall', 'All your ducks are belong to us', '2016-10-01T01:01:00Z', 1);
INSERT INTO Sightings (species, description, "dateTime", count) VALUES ('lesser scaup', 'This is awesome', '2016-12-13T12:05:00Z', 5);
INSERT INTO Sightings (species, description, "dateTime", count) VALUES ('canvasback', '...', '2016-11-30T23:59:00Z', 2);
INSERT INTO Sightings (species, description, "dateTime", count) VALUES ('mallard', 'Getting tired', '2016-11-29T00:00:00Z', 18);
INSERT INTO Sightings (species, description, "dateTime", count) VALUES ('redhead', 'I think this one is called Alfred J.' , '2016-11-29T10:00:01Z', 1);
INSERT INTO Sightings (species, description, "dateTime", count) VALUES ('redhead', 'If it looks like a duck, swims like a duck, and quacks like a duck, then it probably is a duck.' , '2016-12-01T13:59:00Z', 1);
INSERT INTO Sightings (species, description, "dateTime", count) VALUES ('mallard', 'Too many ducks to be counted', '2016-12-12T12:12:12Z', 100);
INSERT INTO Sightings (species, description, "dateTime", count) VALUES ('canvasback', 'KWAAK!!!1', '2016-12-11T01:01:00Z', 5);

