import { buildSchema } from "graphql"
import express from "express"
import { graphqlHTTP } from "express-graphql"

const todos = [
    { id: 1, name: "Todo 1", status: "ready"},
    { id: 2, name: "Todo 2", status: "done"},
]

const schema = buildSchema(`
    input TodoInput {
        name: String!
        status: String!
    }
        
    type Todo {
        id: Int!
        name: String!
        status: String!
    }

    type Mutation {
        createTodo(input: TodoInput): Todo
        updateUser(id: Int!, input: TodoInput): Todo
    }

    type Query {
        getTodo(id: String): Todo
        getTodos: [Todo]
    }
`)

type Todo = {
    id: number
    name: string
    status: string
}

type TodoInput = Pick<Todo, "status"|"name">

const getTodo = (args: { id: number }): Todo | undefined =>
    todos.find(u => u.id === args.id)

const getTodos = (): Todo[] => todos

const createTodo = (args: { input: TodoInput }): Todo => {
    const todo = {
        id: todos.length + 1,
        ...args.input,
    }
    todos.push(todo)
    return todo
}

const updateTodo = (args: { todo: Todo}): Todo => {
    const index = todos.findIndex(u => u.id === args.todo.id)
    const targetTodo = todos[index]

    if (targetTodo) todos[index] = args.todo

    return targetTodo
}

const root = {
    getTodo,
    getTodos,
    createTodo,
    updateTodo,
}

const app = express()

app.use(
    "/graphql",
    graphqlHTTP({
        schema: schema,
        rootValue: root,
        graphiql: true,
    })
)

const PORT = 8000

app.listen(PORT)
console.log(`Running a GraphQL API service at http://localhost:${PORT}/graphql`)