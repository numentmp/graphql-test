import {graphqlHTTP} from 'express-graphql';

import {schema, root} from './schema.mjs'

import {MysqlRepo} from './mysql_repo.mjs'
import {MysqlStorage} from "./mysql_storage.mjs";

/**
 * @param {*} conn
 * @param {boolean} profiling
 * @returns {*}
 */
function mysqlEndpoint(conn, profiling) {
    const opts = (/*request, response, requestParams*/) => {
        const storage = new MysqlStorage(conn, profiling);
        const repo = new MysqlRepo(storage);

        const r = {
            schema,
            rootValue: root,
            context: {repo},
            graphiql: true,
        };

        if (profiling) {
            r.extensions = (/*info*/) => ({profile: storage.profile()});
        }
        return r;
    };
    return graphqlHTTP(opts);
}

export {mysqlEndpoint};
