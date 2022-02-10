import {Car, Driver, Bind} from "./entities.mjs";
import {Repo} from "./repository.mjs";
import {contains, compareFunc, carFieldFunc, driverFieldFunc} from "./dummy_sort.mjs";

class DummyRepo extends Repo {
    /**
     * @type {Car[]}
     */
    cars = [];

    /**
     * @type {Driver[]}
     */
    drivers = [];

    carsGen = 0;
    driversGen = 0;

    nextCarId() {
        return String(++this.carsGen);
    }

    nextDriverId() {
        return String(++this.driversGen);
    }

    async findCarById(id) {
        return this.cars.find((x) => x.carId === id);
    }

    async findDriverById(id) {
        return this.drivers.find((x) => x.driverId === id);
    }

    async findDriversByCarId(id, offset, limit, sort, dir) {
        let r = this.drivers.filter((x) => x.carId === id);

        const fld = driverFieldFunc(sort);
        const cmp = compareFunc(dir);
        r.sort((a, b) => cmp(fld(a), fld(b)));

        return r.slice(offset, offset + limit);
    }

    async listCars(offset, limit, filter, sort, dir) {
        let r = this.cars.filter((x) => contains(x, filter));

        const fld = carFieldFunc(sort);
        const cmp = compareFunc(dir);
        r.sort((a, b) => cmp(fld(a), fld(b)));

        return r.slice(offset, offset + limit);
    }

    async listDrivers(offset, limit, filter, sort, dir) {
        let r = this.drivers.filter((x) => contains(x, filter));

        const fld = driverFieldFunc(sort);
        const cmp = compareFunc(dir);
        r.sort((a, b) => cmp(fld(a), fld(b)));

        return r.slice(offset, offset + limit);
    }

    async addCar(fields) {
        const r = new Car(fields);
        r.carId = this.nextCarId();
        this.cars.push(r);
        return r;
    }

    async addDriver(fields) {
        const r = new Driver(fields);
        r.driverId = this.nextDriverId();
        this.drivers.push(r);
        return r;
    }

    async bind(carId, driverId) {
        const {car, driver} = await this.bindPrep(carId, driverId);
        const changed = driver.carId !== car.carId
        driver.carId = car.carId;
        return new Bind(car, driver, changed);
    }
}

/**
 * @param {Repo} repo
 */
async function fill(repo) {
    const c1 = await repo.addCar({model: "Model1", color: "Color2", plateNumber: "MG021"});
    const c2 = await repo.addCar({model: "Model2", color: "Color1"});

    const d1 = await repo.addDriver({name: "Lewis", license: "5003501"});
    const d2 = await repo.addDriver({name: "Name2", license: "4003501"});
    await repo.addDriver({name: "name3"});
    const d4 = await repo.addDriver({name: "Name4", license: "3003501"});

    await repo.bind(c1.carId, d1.driverId);
    await repo.bind(c1.carId, d2.driverId);
    await repo.bind(c2.carId, d4.driverId);
}

export {DummyRepo, fill};
