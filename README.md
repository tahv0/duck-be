# Duck backend

Simple backend stub for having fun.

## Requirements

Requires [Node.js](https://nodejs.org/) installed with npm.<br>
Tested with Node.js version 4.2.6 and npm v3.10.8.

## Install

```
$ git clone https://github.com/tahv0/duck-be.git
$ cd duck-be
$ npm install

```
## Setup database

Setup your PostgreSQL (or other).<br>
Create new account and alter password (or some key) for it.<br>
Create new database and give select, insert and update rights for your user.<br>
Add your database url, port, database name, user and password in `knexfile.js`<br><br>
To migrate db run
```

$ gulp migrate

```
To populate db run
```
$ gulp populate

```

## Run

To start server run

```
$ gulp serve
```

or if you want to run server in some other port than default 8081

```
$ gulp serve --port <port>
```

where you should replace `<port>` with wanted port number i.e. 3000.

## API
List of all RESTful API methods that currently implemented.
### Sightings
Get all stored sightings
* **URL**:
/sightings
* **METHOD**:
GET
* **Succeeded request**
    * **Code**: 200
    * **Content**:
```
[
  {
    "id": 1,
    "species": "gadwall",
    "description": "All your ducks are belong to us",
    "dateTime": "2016-09-30T22:01:00.000Z",
    "count": 1
  },
  ...
]

```
### Species
List of all stored species.
* **URL**:
/species
* **METHOD**:
GET
* **Succeeded request**
    * **Code**: 200
    * **Content**:
```
[
  {
    "name": "mallard"
  },
  ...
]

```
### Get Sightings by Id
Get single Sighting by Id
* **URL**:
/sightings/:id
* **METHOD**:
GET
* **Succeeded request**
    * **Code**: 200
    * **Content**:
```
{
  "id": 5,
  "species": "redhead",
  "description": "I think this one is called Alfred J.",
  "dateTime": "2016-11-29T08:00:01.000Z",
  "count": 1
}
```
### Update Sighting's informations by Id
Update single Sighting. One cannot change Id.
* **URL**:
/sightings/:id
* **METHOD**:
PATCH
* **Succeeded request**
    * **Code**: 200
    * **Example form data sent to backend (JSON)**:
```
{
  "description": "Changed description and count value",
  "count": 22
}
```
### Delete Sighting by Id
Delete single Sighting.
* **URL**:
/sightings/:id
* **METHOD**:
DELETE
* **Succeeded request**
    * **Code**: 200

### Get report
Get list of Sighting based on request parameters (JSON).
* **URL**:
/sightings/report
* **METHOD**:
GET
* **URL parameters**:
    * **Mandatory**: month and year or startTime and endTime but not both!
        * **year**: integer
        * **month**: integer
        * **startTime**: timestamp in ISO format. I.e 2017-02-17T15:05:52.088Z
        * **endTime**: timestamp in ISO format. I.e 2017-02-17T15:05:52.088Z. Has to be bigger than **startTime**
    * **Optional**: count and species parameters
        * **species**: string I.e redhead. Filters
        * **count**: integer. Defines min count that single Sighting has to have.
* **Succeeded request**
    * **Code**: 200
    * **Content**:
```
[
  {
    "id": 1,
    "species": "gadwall",
    "description": "All your ducks are belong to us",
    "dateTime": "2016-09-30T22:01:00.000Z",
    "count": 6
  },
  ...
]

```

## Usage

If you have trouble for sending POST-requests to API remember to add `Content-Type: application/json`
to request headers. This is only content type supported in API.

When adding new sighting, backend automatically generates id-field for sightings. Id is replaced
in server if it is provided in POST-request body.
