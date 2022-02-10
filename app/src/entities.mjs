/**
 * @param {Object} obj
 * @param {Object} src
 */
function setProps(obj, src) {
    for (let f in src) {
        if (obj.hasOwnProperty(f)) {
            obj[f] = src[f];
        }
    }
}

class Car {
    carId = null;

    model = null;
    color = null;
    plateNumber = null;

    /**
     * @param {Object} src
     */
    constructor(src) {
        setProps(this, src);
    }
}

class Driver {
    driverId = null;
    carId = null;

    name = null;
    license = null;

    /**
     * @param {Object} src
     */
    constructor(src) {
        setProps(this, src);
    }
}

class Bind {
    /**
     * @type {Car}
     */
    car = null;

    /**
     * @type {Driver}
     */
    driver = null;

    changed = false;

    constructor(car, driver, changed) {
        this.car = car;
        this.driver = driver;
        this.changed = changed;
    }
}

/**
 * @param {undefined|Object} obj
 * @returns {undefined|Car}
 */
function objToCar(obj) {
    if (obj) {
        return new Car(obj);
    }
    return undefined;
}

/**
 * @param {undefined|Object} obj
 * @returns {undefined|Driver}
 */
function objToDriver(obj) {
    if (obj) {
        return new Driver(obj);
    }
    return undefined;
}

export {
    Car,
    Driver,
    Bind,
    objToCar,
    objToDriver,
    setProps,
};
