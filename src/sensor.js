const gcpDB = require('./database/gcpDB');
const moment = require('moment-timezone');

const distanceMatrix = require('./distanceMatrix');

module.exports = {
    
    async getSensors(req, res) {
        try {
            let SQL = `SELECT * from wireless_final.sensor `;
            let params = [];
            
            let result = await gcpDB.query(SQL, params);
            
            res.json(result);
            
        } catch (error) {
            console.log(error);
            res.status(500).json( _errorFormat(500, 'INTERNAL_ERROR') );
        }
    },
    
    /**
     * POST
     * 註冊 sensor
     * body {
     *      UID (required), name
     * }
     */
    async signUp(req, res) {
        try {
            
            if (!req?.body?.UID) {
                throw _errorFormat(400, 'NO_SENSOR_UID')
            }
        } catch (error) {
            
            console.log(error);
            res.status(error.error.code).json(error);
            return;
        }
        
        let sensorUID = req.body.UID;
        let sensorName = req.body.name? req.body.name: '';
        
        try {
            
            let SQL = `INSERT INTO wireless_final.sensor (UID, name)
            VALUES (?, ?) `;
            params = [sensorUID, sensorName];
            
            await gcpDB.query(SQL, params);
            res.send('sign up successfully');
        } catch (error) {
            
            console.log(error);
            res.status(403).json( _errorFormat(403, 'SENSOR_HAD_BEEN_REGISTED') );
        }
    },
    
    
    /**
     * POST
     * GPS定位資料上傳
     */
    async sensorDataUpload(req, res) {
        if (!req.params.sensorUID || !req.body.latitude || !req.body.longitude || !req.body.battery) {
            res.status(400).json( _errorFormat(400, 'NEED_REQUIRED_ARGUMENTS') );
            return;
        }
        
        let sensorUID = req.params.sensorUID;
        let latitude = parseFloat(req.body.latitude);
        let longitude = parseFloat(req.body.longitude);
        let battery = parseFloat(req.body.battery);
        
        if (isNaN(latitude) || latitude > 90 || latitude < -90) {
            res.status(400).json( _errorFormat(400, 'LAITUDE_FORMAT_ERROR') );
            return;
        }
        
        if (isNaN(longitude) || longitude > 180 || longitude < -180) {
            res.status(400).json( _errorFormat(400, 'LONGITUDE_FORMAT_ERROR') );
            return;
        }

        if (isNaN(battery) || battery > 1 || battery < 0) {
            res.status(400).json( _errorFormat(400, 'BATTERY_FORMAT_ERROR') );
            return;
        }
        
        try {
            
            let SQL = `INSERT INTO wireless_final.sensor_history
            (sensor_UID, latitude, longitude, uploaded_at)
            VALUES (?, ?, ?, ?) `;
            let params = [sensorUID, latitude, longitude, new Date()];
            
            await gcpDB.query(SQL, params);

            SQL = `UPDATE wireless_final.sensor
            SET battery = ?, updated_at = ?
            WHERE UID = ?`;
            params = [battery, new Date(), sensorUID];

            await gcpDB.query(SQL, params);
            res.send('gps data upload successfully');
        } catch (error) {
            
            console.log(error);
            if (error.errno === 1452) res.status(403).json( _errorFormat(403, 'SENSOR_HAS_NOT_REGIST') );
            else res.status(500).json( _errorFormat(500, 'DB_ERROR') );
        }
    }, 

    /**
     * GET
     * 獲得歷史觀測紀錄
     */
    async getHistory(req, res) {
        try {
            let limit = parseInt(req.query.limit) || 5;
            let SQL = `SELECT * from wireless_final.sensor_history
            ORDER BY uploaded_at DESC 
            LIMIT ?`;
            let params = [limit];

            let result = await gcpDB.query(SQL, params);
            for (let data of result) {
                data.uploaded_at = moment.tz(data.uploaded_at, 'Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
            }
            res.json(result);
        } catch (error) {
            console.log(error);
            res.status(500).json( _errorFormat(500, 'DB_ERROR') );
        }
    },

    /**
     * 刪除 sensor
     */
    async deleteSensor(req, res) {
        try {
            let sensorUID = req.params.sensorUID;
            let SQL = `DELETE from wireless_final.sensor 
            WHERE UID = ? `;
            let params = [sensorUID];

            await gcpDB.query(SQL, params);
            res.send('delete successfully');
        } catch (error) {
            console.log(error);
            res.status(500).json( _errorFormat(500, 'DB_ERROR') );
        }
    },

    /**
     * 獲得電池電量
     */
    async getBattery(req, res) {
        try {
            let sensorUID = req.params.sensorUID;
            let SQL = `SELECT battery FROM wireless_final.sensor 
            WHERE UID = ?`;
            let parmas = [sensorUID];

            let result = await gcpDB.query(SQL, parmas);
            if (!result.length) res.status(404).json( _errorFormat(404, 'NO_SUCH_SENSOR') );
            else res.json(result[0]);

        } catch (error) {
            console.log(error);
            res.status(500).json( _errorFormat(500, 'DB_ERROR') );
        }
    },


    /**
     * 獲得你和 sensor 的距離及時間資訊
     */
    async getDistance(req, res) {
        try {
            if (!req.params.sensorUID || !req.query.your_latitude || !req.query.your_longitude) {
                res.status(400).json( _errorFormat(400, 'NEED_REQUIRED_ARGUMENTS') );
                return;
            } 

            let sensorUID = req.params.sensorUID;
            let your_latitude = req.query.your_latitude;
            let your_longitude = req.query.your_longitude;
            let SQL = `SELECT latitude, longitude, uploaded_at FROM wireless_final.sensor_history
            WHERE sensor_UID = ?
            ORDER BY uploaded_at DESC
            LIMIT 1`;
            let params = [sensorUID];
            let result = await gcpDB.query(SQL, params);
            if (!result.length) {
                res.status(404).json( _errorFormat(404, 'NO_THIS_SENSOR_DATA') );
                return;
            }
            
            let sensor_latitude = result[0].latitude;
            let sensor_longitude = result[0].longitude;
            let lastUpdate = result[0].uploaded_at;
            console.log(sensor_latitude, sensor_longitude, your_latitude, your_longitude)

            result = await distanceMatrix(your_latitude + ', ' + your_longitude, 
                sensor_latitude + ', ' + sensor_longitude);
            
            if (result.rows[0].elements[0].status !== 'OK') {
                res.status(400).json( _errorFormat(404, result.rows[0].elements[0].status) );
                return;
            }

            res.json({
                your_address: result.origin_addresses[0],
                sensor_address: result.destination_addresses[0],
                distance: result.rows[0].elements[0].distance,
                duration: result.rows[0].elements[0].duration,
                last_update: _lastUpdateFormat(lastUpdate),
                latitude: sensor_latitude,
                longitude: sensor_longitude
            })
            
        } catch (error) {
            console.log(error);
            res.status(500).json( _errorFormat(500, 'INTERNAL_ERROR') );
        }
    },

    async getLocation(req, res) {
        try {
            if (!req.params.sensorUID) {
                res.status(400).json( _errorFormat(400, 'NEED_REQUIRED_ARGUMENTS') );
                return;
            } 
            let sensorUID = req.params.sensorUID;

            let SQL = `SELECT latitude, longitude, uploaded_at FROM wireless_final.sensor_history
            WHERE sensor_UID = ?
            ORDER BY uploaded_at DESC
            LIMIT 1`;
            let params = [sensorUID];
            let result = await gcpDB.query(SQL, params);
            if (!result.length) {
                res.status(404).json( _errorFormat(404, 'NO_THIS_SENSOR_DATA') );
                return;
            }

            res.json({
                latitude: result[0].latitude,
                longitude: result[0].longitude,
                last_update: _lastUpdateFormat(result[0].uploaded_at)
            })

        } catch (error) {
            console.log(error);
            res.status(500).json( _errorFormat(500, 'INTERNAL_ERROR') );
        }
    },


    /**
     * 獲取感測器足跡
     */
    async getFootPrint(req, res) {
        try {
            if (!req.params.sensorUID || !req.query.date) {
                res.status(400).json( _errorFormat(400, 'NEED_REQUIRED_ARGUMENTS') );
                return;
            }

            let sensorUID = req.params.sensorUID;
            let date = moment.tz(req.query.date + ' 00:00:00', 'Asia/Taipei').toDate();
            let dateEnd = moment.tz(date, 'Asia/Taipei').add(1, 'day').toDate();
            let SQL = `SELECT latitude, longitude, uploaded_at
            FROM wireless_final.sensor_history
            WHERE sensor_UID = ? AND uploaded_at BETWEEN ? AND ?
            ORDER BY uploaded_at ASC`;
            let params = [sensorUID, date, dateEnd];

            let result = await gcpDB.query(SQL, params);
            if (!result.length) {
                res.json(result);
                return;
            }
            
            let current = 0;
            while (current < result.length-1) {
                let diff = moment.tz(result[current+1].uploaded_at, 'Asia/Taipei').diff(moment.tz(result[current].uploaded_at, 'Asia/Taipei'), 'minute');
                
                if (diff < 40) result.splice(current+1, 1);
                else current += 1;
            }
            result.forEach(element => {
                element.uploaded_at = moment.tz(element.uploaded_at, 'Asia/Taipei').format('HH:mm:ss');
            })

            res.json(result);
            
        } catch (error) {
            console.log(error);
            res.status(500).json( _errorFormat(500, 'INTERNAL_ERROR') );
        }
    }
}


/**
 * 與現在相差了多久
 */
function _lastUpdateFormat(last) {
    let now = moment.tz(new Date, 'Asia/Taipei');
    last = moment.tz(last, 'Asia/Taipei');

    let diff_month = now.diff(last, 'month');
    if (diff_month) return `${diff_month}個月前`;

    let diff_day = now.diff(last, 'day');
    if (diff_day) return `${diff_day}天前`;

    let diff_hour = now.diff(last, 'hour');
    if (diff_hour) return `${diff_hour}小時前`;

    let diff_minute = now.diff(last, 'minute');
    if (diff_minute) return `${diff_minute}分鐘前`;

    let diff_second = now.diff(last, 'second');
    if (diff_second) return `${diff_second}秒前`;

    return '';
}

function _errorFormat(code, message) {
    return {
        error: {
            code,
            message
        }
    }
}