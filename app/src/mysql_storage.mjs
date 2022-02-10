import mysql from "mysql";

class MysqlStorage {
    conn = null;
    profiling = false;

    statSelect = 0;
    statUpdate = 0;

    /**
     * @type {Object[]}
     */
    statQueries = [];

    constructor(conn, profiling) {
        this.conn = conn;
        this.profiling = profiling;
    }

    /**
     * @returns {Object}
     */
    profile() {
        return {
            select: this.statSelect,
            update: this.statUpdate,
            queries: this.statQueries,
        }
    }

    /**
     * @param sql
     * @param args
     * @returns {Promise<{results: Object[], fields: Object[]}>}
     */
    query(sql, args) {
        if (this.profiling) {
            this.statQueries.push({
                sql: sql,
                args: args,
            });
        }

        return new Promise((resolve, reject) => {
            this.conn.query(sql, args, (error, results, fields) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({results, fields});
                }
            })
        });
    }

    /**
     * @param sql
     * @param args
     * @returns {Promise<{results: Object[], fields: Object[]}>}
     */
    select(sql, args) {
        if (this.profiling) {
            this.statSelect++;
        }

        return this.query(sql, args);
    }

    /**
     * @param sql
     * @param args
     * @returns {Promise<{results: Object|undefined, fields: Object[]}>}
     */
    async select1(sql, args) {
        if (this.profiling) {
            this.statSelect++;
        }

        const {results, fields} = await this.query(sql, args);

        if (results.length >= 1) {
            return {row: results[0], fields};
        } else {
            return {row: undefined, fields};
        }
    }

    /**
     * @param sql
     * @param args
     * @returns {Promise<{results: Object, fields: Object[]}>}
     */
    update(sql, args) {
        if (this.profiling) {
            this.statUpdate++;
        }

        return this.query(sql, args);
    }
}

function connect(host, user, password, database) {
    return mysql.createPool({host, user, password, database});
}

export {MysqlStorage, connect};
