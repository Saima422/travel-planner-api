import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'

async function startServer() {
  const server = new ApolloServer({
    typeDefs: `
      type Query {
        _placeholder: String
      }
    `,
  })

  const PORT = 8000
  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
  })

  console.log(`Server started at ${url}`)
}

startServer()
