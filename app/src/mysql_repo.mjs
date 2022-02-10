import {Car, Driver, Bind, objToCar, objToDriver} from "./entities.mjs";
import {Repo} from "./repository.mjs";
import {sortDir, carField, driverField, filterCond} from "./mysql_sort.mjs";

const carFields = [
    'car_id as carId',
    'model',
    'color',
    'plate_number as plateNumber',
];

const driverFields = [
    'driver_id as driverId',
    'car_id as carId',
    'name',
    'license',
];

const sqlCarFields = carFields.join(',\n  ');
const sqlDriverFields = driverFields.join(',\n  ');

class MysqlRepo extends Repo {
    /**
     * @type {MysqlStorage}
     */
    storage = null

    /**
     * @param {MysqlStorage} storage
     */
    constructor(storage) {
        super();
        this.storage = storage;
    }

    async findCarById(id) {
        const {row} = await this.storage.select1(
            `SELECT\n  ${sqlCarFields}\nFROM car\nWHERE car_id = ?`,
            [id]
        );
        return objToCar(row);
    }

    async findDriverById(id) {
        const {row} = await this.storage.select1(
            `SELECT\n  ${sqlDriverFields}\nFROM driver\nWHERE driver_id = ?`,
            [id]
        );
        return objToDriver(row);
    }

    async findDriversByCarId(id, offset, limit, sort, dir) {
        let sql = `SELECT\n  ${sqlDriverFields}\nFROM driver\nWHERE car_id = ?`;
        /**
         * @type {*[]}
         */
        const args = [id];

        sql += `\nORDER BY ${driverField(sort)} ${sortDir(dir)}`;

        sql += '\nLIMIT ?, ?';
        args.push(offset, limit);

        const {results} = await this.storage.select(sql, args);
        return results.map((row) => new Driver(row));
    }

    async listCars(offset, limit, filter, sort, dir) {
        let sql = `SELECT\n  ${sqlCarFields}\nFROM car`;
        const args = [];

        if (filter !== '') {
            const {s, a} = filterCond(filter, ['model', 'color', 'plate_number']);
            sql += `\nWHERE\n  ${s.join('\n  OR ')}`;
            args.push(...a);
        }

        sql += `\nORDER BY ${carField(sort)} ${sortDir(dir)}`;

        sql += '\nLIMIT ?, ?';
        args.push(offset, limit);

        const {results} = await this.storage.select(sql, args);
        return results.map((row) => new Car(row));
    }

    async listDrivers(offset, limit, filter, sort, dir) {
        let sql = `SELECT\n  ${sqlDriverFields}\nFROM driver`;
        const args = [];

        if (filter !== '') {
            const {s, a} = filterCond(filter, ['name', 'license']);
            sql += `\nWHERE\n  ${s.join('\n  OR ')}`;
            args.push(...a);
        }

        sql += `\nORDER BY ${driverField(sort)} ${sortDir(dir)}`;

        sql += '\nLIMIT ?, ?';
        args.push(offset, limit);

        const {results} = await this.storage.select(sql, args);
        return results.map((row) => new Driver(row));
    }

    async addCar(fields) {
        const r = new Car(fields);

        const sql = 'INSERT INTO car (\n  model, color, plate_number\n) VALUES (?, ?, ?)';
        const args = [r.model, r.color, r.plateNumber];

        const {results} = await this.storage.update(sql, args);

        r.carId = results.insertId;
        return r;
    }

    async addDriver(fields) {
        const r = new Driver(fields);

        const sql = 'INSERT INTO driver (\n  name, license\n) VALUES (?, ?)';
        const args = [r.name, r.license];

        const {results} = await this.storage.update(sql, args);

        r.driverId = results.insertId;
        return r;
    }

    async bind(carId, driverId) {
        const {car, driver} = await this.bindPrep(carId, driverId);

        const sql = 'UPDATE driver\nSET car_id = ?\nWHERE\n  driver_id = ?\n  AND car_id != ?';
        const args = [car.carId, driver.driverId, car.carId];

        const {results} = await this.storage.update(sql, args);

        driver.carId = car.carId;
        return new Bind(car, driver, results.affectedRows !== 0);
    }
}

export {MysqlRepo};
