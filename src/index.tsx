import React from "react";
import ReactDOM from "react-dom";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import App from "./App";

import "normalize.css";

const GITHUB_AUTH_TOKEN = process.env.REACT_APP_AUTH_TOKEN;
const gqlClient = new ApolloClient({
  uri: "https://api.github.com/graphql",
  request: (operation) => {
    operation.setContext({
      headers: {
        authorization: GITHUB_AUTH_TOKEN ? `Bearer ${GITHUB_AUTH_TOKEN}` : "",
      },
    });
  },
});

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={gqlClient}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
