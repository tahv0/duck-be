var gulp = require('gulp'),
util = require('gulp-util'),
Promise = require('bluebird'),
path = require('path'),
fs = Promise.promisifyAll(require('fs')),
Knex = require('knex'),
app = require('./app');

var environment = 'development';
var dbConfig = require('./knexfile')[environment];

gulp.task('serve', function () {
    var port = process.env.PORT || 8081;
    var paramPort = util.env.port;
    if (paramPort)
    {
        port = paramPort;
    }
    var server = app(dbConfig).listen(port, function () {
        util.log('Server (' + environment + ') listening on port ' + server.address().port);
    });
});

gulp.task('migrate', function () {
    return executeSqlFile('schema.sql');
});

gulp.task('populate', function () {
    return executeSqlFile('populate.sql');
});

function executeSqlFile(fileName) {
    return fs.readFileAsync(path.join('./data', fileName), 'utf-8')
    .then(Knex(dbConfig).raw);
}
