'use strict';

const
  apollo = require('apollo-server-express');

const typeDefs = apollo.gql`
  schema {
      query: MyQuery
      mutation: MyMutation
  }
  
  type MyQuery {
      todo(id: Int!): Todo
      lastTodo: Todo
      todos: [Todo!]! @acl(requirements: {groups: ["/oneconcern/*"], roles: ["todos:read"]})
  }
  
  type MyMutation {
      createTodo(todo: TodoInput!): Todo! @acl(requirements: {
          groups: ["/oneconcern"],
          roles: ["todo:write"]
        })
      updateTodo(id: Int!, todo: TodoInput!): Todo! @acl(requirements: {
          groups: ["/oneconcern"],
          roles: ["todo:write"]
        })
  }
  
  type Todo {
      id: Int!
      text: String!
      done: Boolean!
  }
  
  "Passed to createTodo to create a new todo"
  input TodoInput {
      "The body text"
      text: String!
      "Is it done already?"
      done: Boolean
  }
  
  #scalar Map
  
  input Requirements {
     groups: [String!]
     roles: [String!]
  }
  
  directive @acl(requirements: Requirements) on OBJECT|FIELD_DEFINITION
`;

var todos = [
  { id: 1, text: 'seed todo entry', done: false, },
];

const resolver = {
  MyQuery: {
    todos: () => todos,
  },
};


module.exports = {
  typeDefs: typeDefs,
  resolver: resolver,
};
