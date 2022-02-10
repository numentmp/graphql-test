import {graphqlHTTP} from 'express-graphql';

import {schema, root} from './schema.mjs'

import {DummyRepo, fill} from './dummy_repo.mjs'

function dummyEndpoint() {
    const repo = new DummyRepo();
    fill(repo);

    const opts = {
        schema,
        rootValue: root,
        context: {repo},
        graphiql: true,
    };
    return graphqlHTTP(opts);
}

export {dummyEndpoint};
