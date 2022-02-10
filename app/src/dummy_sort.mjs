function compareFunc(dir) {
    switch (dir) {
        case 'ASC':
            return (a, b) => (a < b ? -1 : a > b ? 1 : 0);
        case 'DESC':
            return (a, b) => (a > b ? -1 : a < b ? 1 : 0);
        default:
            throw `Unknown sort direction '${dir}'`;
    }
}

function carFieldFunc(sort) {
    switch (sort) {
        case 'CAR_ID':
            return (x) => (x?.carId ?? '');
        case 'MODEL':
            return (x) => (x?.model ?? '');
        case 'COLOR':
            return (x) => (x?.color ?? '');
        case 'PLATE_NUMBER':
            return (x) => (x?.plateNumber ?? '');
        default:
            throw `Unknown sort field '${sort}'`;
    }
}

function driverFieldFunc(sort) {
    switch (sort) {
        case 'DRIVER_ID':
            return (x) => (x?.driverId ?? '');
        case 'NAME':
            return (x) => (x?.name ?? '');
        case 'LICENSE':
            return (x) => (x?.license ?? '');
        default:
            throw `Unknown sort field '${sort}'`;
    }
}

function contains(obj, str) {
    if (str === '') {
        return true;
    }

    for (let x in obj) {
        if (obj.hasOwnProperty(x) && String(obj[x]).indexOf(str) !== -1) {
            return true
        }
    }
    return false;
}

export {contains, compareFunc, carFieldFunc, driverFieldFunc};
