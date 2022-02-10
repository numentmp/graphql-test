function sortDir(dir) {
    switch (dir) {
        case 'ASC':
            return 'ASC';
        case 'DESC':
            return 'DESC';
        default:
            throw `Unknown sort direction '${dir}'`;
    }
}

function carField(sort) {
    switch (sort) {
        case 'CAR_ID':
            return 'car_id';
        case 'MODEL':
            return 'model';
        case 'COLOR':
            return 'color';
        case 'PLATE_NUMBER':
            return 'plate_number';
        default:
            throw `Unknown sort field '${sort}'`;
    }
}

function driverField(sort) {
    switch (sort) {
        case 'DRIVER_ID':
            return 'driver_id';
        case 'NAME':
            return 'name';
        case 'LICENSE':
            return 'license';
        default:
            throw `Unknown sort field '${sort}'`;
    }
}

function filterCond(str, fields) {
    const x = '%' + str.replace(/[_%#]/g, '#$&') + '%';

    let s = [];
    const a = [];

    for (let field of fields) {
        s.push(`COALESCE(${field}, '') LIKE ? ESCAPE '#'`);
        a.push(x);
    }

    return {s, a};
}

export {sortDir, carField, driverField, filterCond};
