import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { ApolloProvider } from "@apollo/react-hooks";

const httpLink = createHttpLink({
  uri: "https://massive-mayfly-81.hasura.app/v1/graphql",
});

const authLink = setContext((_, { headers }) => {
  const token =
    "TuBAnZBe3qUBxOJ9zqvxdRa78S9ttUXlidXWWHzQYNhnID8wZBbP50kx2wq7bP5h";
  return {
    headers: {
      ...headers,
      "x-hasura-admin-secret": token,
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

// client
//   .query({
//     query: gql`
//       query getToDo {
//         todos {
//           done
//           id
//           text
//         }
//       }
//     `,
//   })
//   .then((data) => console.log(data));

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
