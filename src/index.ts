import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { typeDefs } from './schema/typeDefs'
import { resolvers } from './resolvers'

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  })

  const PORT = 8000
  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
  })

  console.log(`Server started at ${url}`)
}

startServer()
