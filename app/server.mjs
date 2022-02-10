import express from 'express';
import {dummyEndpoint} from './src/dummy_endpoint.mjs';
import {mysqlEndpoint} from './src/mysql_endpoint.mjs';
import {connect} from "./src/mysql_storage.mjs";

const app = express();

const conn = connect(
    process.env.APP_DB_HOST ?? 'db',
    process.env.APP_DB_USER ?? 'app',
    process.env.APP_DB_PASS ?? 'password',
    process.env.APP_DB_NAME ?? 'app',
);

const profiling = process.env.NODE_ENV !== 'production';

app.use('/dummy', dummyEndpoint());
app.use('/mysql', mysqlEndpoint(conn, profiling));
app.use('/profile', mysqlEndpoint(conn, true));
app.use('/', express.static('demo'));

app.listen(8080, () => console.log('Started (' + (new Date()).toUTCString() + ')'));
