/**
 * @type {Object<string, string|{q: string, v: string}>}
 */
const queries = (() => {
    const carFields = `fragment CarFields on Car {
  carId
  model
  color
  plateNumber
}`;

    const driverFields = `fragment DriverFields on Driver {
  driverId
  carId
  name
  license
}`;

    const q1 = `${carFields}

query AllCars {
  cars {
    ...CarFields
  }
}`;

    const q2 = `${driverFields}

query AllDrivers {
  drivers {
    ...DriverFields
  }
}`;

    const q3 = `query ById {
  driverById(id: "1") {
    name
    car {
      model
    }
  }

  carById(id: "1") {
    model
    drivers {
      name
    }
  }
}`;

    const q4 = `${carFields}

query FindCars {
  cars(filter: "G02", sort: MODEL, dir: DESC, limit: 5) {
    ...CarFields
  }
}
`;

    const q5 = `${driverFields}

query FindDrivers {
  drivers(filter: "Lewis", sort: NAME, dir: DESC, limit: 5) {
    ...DriverFields
  }
}
`;

    const q6 = `query Complex {
  drivers(filter: "5003", sort: LICENSE, limit: 5) {
    name
    license
    car {
      model
      drivers(sort: NAME) {
        name
      }
    }
  }
}`;

    const m1 = {
        q: `${carFields}

mutation AddCar($input: CarInput!) {
  addCar(fields: $input) {
    ...CarFields
  }
}`,
        v: `{
  "input": {
    "model": "test zzz4",
    "color": "yyy",
    "plateNumber": "11111"
  }
}`
    };

    const m2 = `${driverFields}

mutation AddDriver {
  addDriver(fields: {name: "test xxx5"}) {
    ...DriverFields
  }
}
`;

    const m3 = `mutation Bind {
  bind(carId: 2, driverId: 5) {
    changed
  }
}`;

    const m3a = `mutation Bind {
  bind(carId: 2, driverId: 5) {
    changed
    car {
      model
      drivers(sort: NAME, dir: DESC) {
        name
      }
    }
  }
}`;

    return {q1, q2, q3, q4, q5, q6, m1, m2, m3, m3a};
})();
