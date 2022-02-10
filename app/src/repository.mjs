import {Car, Driver, Bind} from "./entities.mjs";

class Repo {
    /**
     * @param {String} id
     * @return {Promise<Car|undefined>}
     */
    async findCarById(id) {
        throw 'not implemented';
    }

    /**
     * @param {String} id
     * @return {Promise<Driver|undefined>}
     */
    async findDriverById(id) {
        throw 'not implemented';
    }

    /**
     * @param {String} id
     * @param {number} offset
     * @param {number} limit
     * @param {String} sort
     * @param {String} dir
     * @return {Promise<Driver[]>}
     */
    async findDriversByCarId(id, offset, limit, sort, dir) {
        throw 'not implemented';
    }

    /**
     * @param {number} offset
     * @param {number} limit
     * @param {String} filter
     * @param {String} sort
     * @param {String} dir
     * @return {Promise<Car[]>}
     */
    async listCars(offset, limit, filter, sort, dir) {
        throw 'not implemented';
    }

    /**
     * @param {number} offset
     * @param {number} limit
     * @param {String} filter
     * @param {String} sort
     * @param {String} dir
     * @return {Promise<Driver[]>}
     */
    async listDrivers(offset, limit, filter, sort, dir) {
        throw 'not implemented';
    }

    /**
     * @param {Object} fields
     * @return {Promise<Car>}
     */
    async addCar(fields) {
        throw 'not implemented';
    }

    /**
     * @param {Object} fields
     * @return {Promise<Driver>}
     */
    async addDriver(fields) {
        throw 'not implemented';
    }

    /**
     * @param {String} carId
     * @param {String} driverId
     * @return {Promise<{car: Car, driver: Driver}>}
     */
    async bindPrep(carId, driverId) {
        const car = await this.findCarById(carId);
        if (!car) {
            throw `car '${carId}' not found`;
        }

        const driver = await this.findDriverById(driverId);
        if (!driver) {
            throw `driver '${driverId}' not found`;
        }

        return {car, driver};
    }

    /**
     * @param {String} carId
     * @param {String} driverId
     * @return {Promise<Bind>}
     */
    async bind(carId, driverId) {
        throw 'not implemented';
    }
}

export {Repo};
