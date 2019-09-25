'use strict';

// a sample express application using JWT auhentication.

const
  uuid = require('uuid/v4'),
  console = require('console'),
  express = require('express'),
  authorizer = require('js-authservice');

const config  = {
  signingAuthorityUrl:'https://auth.dev.onec.co/auth/realms/oneconcern/protocol/openid-connect/certs',
  timingTolerance: '12h', // defaults to 5m
  logLevel: 'debug',
  // mock in config in effect disables authN
  mock: { sub: uuid(), email: 'frederic@oneconcern.com', preferred_username: 'frederic', 'given_name': 'Frédéric', 'family_name': 'BIDON' },
};

const app = express();

// unauthenticated route
app.get('/free', (req,res) => {  
  console.info('rendering: no authentication');
  res.json({message: 'white listed route'});
});

// authenticatd route
app.use('/playground', authorizer.authenticate(config));

app.get('/playground', (req,res) => {
  console.info('rendering: authenticated');
  res.json({message: 'authenticated', principal: authorizer.getPrincipal(req)});
});

console.info('serving http://demo.localtest.me:6092');
app.listen(6092, 'demo.localtest.me');
