import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const BASE_URL = process.env.REACT_APP_API_URL;

// HTTP Link to connect to GraphQL server
const httpLink = createHttpLink({
  uri: `${BASE_URL}/graphql`,
});

// Auth Link to add the JWT token to requests
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token'); // Retrieve token from localStorage
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '', // Add Authorization header
    },
  };
});

// Apollo Client setup
const client = new ApolloClient({
  link: authLink.concat(httpLink), // Combine authLink and httpLink
  cache: new InMemoryCache(),
});

export default client;