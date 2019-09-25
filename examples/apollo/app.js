'use strict';

// a sample apollo GraphQL server using our express middleware as JWT authenticator
// and some @acl directive for authorization.

const
  uuid = require('uuid/v4'),
  console = require('console'),
  express = require('express'),
  { ApolloServer } = require('apollo-server-express'),
  authorizer = require('js-authservice'),
  resolvers = require('./resolvers');

const config  = {
  signingAuthorityUrl:'https://auth.dev.onec.co/auth/realms/oneconcern/protocol/openid-connect/certs',
  timingTolerance: '12h', // defaults to 5m
  logLevel: 'debug',
  // mock in config in effect disables authN
  mock: {
    sub: uuid(), 
    email: 'frederic@oneconcern.com', 
    preferred_username: 'frederic', 
    'given_name': 'Frédéric', 
    'family_name': 'BIDON',
    groups: [ '/oneconcern/dev', '/another' ],
    'realm_access': { 'roles': ['todos:read'] },
    'resource_access': { 'account': { 'roles': ['vip'] }},
  },
};

const app = express();

// authenticate all routes
app.use(authorizer.authenticate(config));

const server = new ApolloServer({
  typeDefs: resolvers.typeDefs,
  resolvers: resolvers.resolver,
  context: ({ req }) => { return authorizer.getPrincipal(req); },
  // provides schema-driven AuthZ via directive
  //
  // NOTE: this particular directive provides support for simple RBAC requirements (e.g. groups and roles)
  //
  // More advanced directive support (e.g. AuthZ requirement expressed in terms of product, feature, hazard... )
  // is not provided yet.
  schemaDirectives: {
    // by default, pass the full context to directive (expected as principal)
    // If we have some other context structure, pass a context transformation func:
    // e.g.:
    // acl: authorizer.aclGraphQLDirective( (context) => { return context.principal; }),  
    acl: authorizer.aclGraphQLDirective(),  
  },
});

server.applyMiddleware({ app });
console.info('serving http://demo.localtest.me:6092');
app.listen(6092, 'demo.localtest.me');
