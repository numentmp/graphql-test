import {makeExecutableSchema} from '@graphql-tools/schema';

const typeDefs = `
    type Query {
        cars(
            offset: Int = 0
            limit: Int = 20
            filter: String = ""
            sort: CarSort = CAR_ID
            dir: SortDir = ASC
        ): [Car!]!

        drivers(
            offset: Int = 0
            limit: Int = 20
            filter: String = ""
            sort: DriverSort = DRIVER_ID
            dir: SortDir = ASC
        ): [Driver!]!

        carById(id: ID!): Car

        driverById(id: ID!): Driver
    }

    enum SortDir {
        ASC
        DESC
    }    
    enum CarSort {
        CAR_ID
        MODEL
        COLOR
        PLATE_NUMBER
    }
    enum DriverSort {
        DRIVER_ID
        NAME
        LICENSE
    }
    
    type Car {
        carId: ID!
        model: String!
        color: String!
        plateNumber: String
        drivers(
            offset: Int = 0
            limit: Int = 20
            sort: DriverSort = DRIVER_ID
            dir: SortDir = ASC
        ): [Driver!]!
    }

    type Driver {
        driverId: ID!
        carId: ID
        name: String!
        license: String
        car: Car
    }
    
    type Bind {
        car: Car!
        driver: Driver!
        changed: Boolean!
    }
    
    type Mutation {
        addCar(fields: CarInput!): Car!
        addDriver(fields: DriverInput!): Driver!
        bind(carId: ID, driverId: ID): Bind!
    }

    input CarInput {
        model: String!
        color: String!
        plateNumber: String
    }
    
    input DriverInput {
        name: String!
        license: String
    }

    input BindInput {
        carId: ID!
        driverId: ID!
    }
`;

const resolvers = {
    Query: {
        /**
         * @param _
         * @param {number} offset
         * @param {number} limit
         * @param {String} filter
         * @param {String} sort
         * @param {String} dir
         * @param {Repo} repo
         * @returns {Promise<Car[]>}
         */
        cars: (_, {offset, limit, filter, sort, dir}, {repo}) =>
            repo.listCars(offset, limit, filter, sort, dir),

        /**
         * @param _
         * @param {number} offset
         * @param {number} limit
         * @param {String} filter
         * @param {String} sort
         * @param {String} dir
         * @param {Repo} repo
         * @returns {Promise<Driver[]>}
         */
        drivers: (_, {offset, limit, filter, sort, dir}, {repo}) =>
            repo.listDrivers(offset, limit, filter, sort, dir),

        /**
         * @param _
         * @param id
         * @param repo
         * @return {Promise<Car|undefined>}
         */
        carById: (_, {id}, {repo}) => repo.findCarById(id),

        /**
         * @param _
         * @param {String} id
         * @param {Repo} repo
         * @return {Promise<Driver|undefined>}
         */
        driverById: (_, {id}, {repo}) => repo.findDriverById(id),
    },

    Mutation: {
        /**
         * @param _
         * @param {Object} fields
         * @param {Repo} repo
         * @returns {Promise<Car>}
         */
        addCar: (_, {fields}, {repo}) => repo.addCar(fields),

        /**
         * @param _
         * @param {Object} fields
         * @param {Repo} repo
         * @returns {Promise<Driver>}
         */
        addDriver: (_, {fields}, {repo}) => repo.addDriver(fields),

        /**
         * @param _
         * @param {String} carId
         * @param {String} driverId
         * @param {Repo} repo
         * @returns {Promise<Bind>}
         */
        bind: (_, {carId, driverId}, {repo}) => repo.bind(carId, driverId),
    },

    Car: {
        /**
         * @param {String} carId
         * @param {number} offset
         * @param {number} limit
         * @param {String} sort
         * @param {String} dir
         * @param _
         * @param {Repo} repo
         * @returns {Promise<Driver[]>}
         */
        drivers: ({carId}, {
            offset,
            limit,
            sort,
            dir
        }, {repo}) => repo.findDriversByCarId(carId, offset, limit, sort, dir),
    },

    Driver: {
        /**
         * @param {String} carId
         * @param _
         * @param {Repo} repo
         * @returns {Promise<Car|undefined>}
         */
        car: ({carId}, _, {repo}) => repo.findCarById(carId),
    },
};

const schema = makeExecutableSchema({typeDefs, resolvers});
const root = {};

export {schema, root};
