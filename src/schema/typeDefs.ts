import { gql } from 'graphql-tag'

export const typeDefs = gql`
  type Query {
    citySuggestions(name: String!): [City!]!
  }

  # ID: Apollo Client cache normalization
  # lat, lon and timezone are to be used for weatherForecast
  # countryCode can be used later for city search based on country
  type City {
    id: ID!
    name: String!
    country: String!
    lat: Float!
    lon: Float!
    timezone: String!
    countryCode: String!
  }
`
