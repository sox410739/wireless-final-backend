var express = require('express');
var router = express.Router();
const sensor = require('../src/sensor');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/sensor-sign-up', sensor.signUp);
router.post('/sensors/:sensorUID/gps-data', sensor.sensorDataUpload)

module.exports = router;
