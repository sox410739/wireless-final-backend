const mysql = require('promise-mysql');

/**
 * 定義了 database 的 class
 * class 中有
 * createPool (private) 型別為 promise
 * query (public) 從 pool 取得 connection 後做 query 並 release
 * end (public) end pool 
 */
module.exports = class Datebase {
    #createPool;

    constructor(config) {
        this.#createPool = mysql.createPool(config);
    }

    
    async query(SQL, params) {
        let pool = await this.#_connect();
        let result = await this.#_query(pool, SQL, params);

        return result;
    }

    async end() {
        let pool = await this.#_connect();

        await this.#end(pool);
    }


    async #_connect() {
        try {
            let pool = await this.#createPool;
    
            return pool;
        } catch (error) {
            console.log(error);
            throw {
                error: {
                    code: 500,
                    message: 'DB_CONNECT_ERROR'
                }
            }
        }
    }

    async #_query(pool, SQL, params) {
        try {
            let result = await pool.query(SQL, params);
            result = JSON.parse( JSON.stringify(result) );
    
            return result;
        } catch (error) {
            throw error
        }
    }

    async #end(pool) {
        try {
            await pool.end();
        } catch (error) {
            console.log(error);
            throw {
                error: {
                    code: 500,
                    message: 'DB_POOL_END_ERROR'
                }
            }
        }
    }
}