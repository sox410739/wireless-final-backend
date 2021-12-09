var express = require('express');
const apis = require('./apis');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/apis', apis);

module.exports = router;
