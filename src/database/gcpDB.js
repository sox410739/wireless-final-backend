const dbConfig = require('../../config').dbConfig;
const Database = require('./database');

module.exports = new Database(dbConfig);