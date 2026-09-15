// import express from "express";
// import { ApolloServer } from "@apollo/server";
// import { expressMiddleware } from "@as-integrations/express5";

// import { typeDefs } from "./graphql/schema.js";
// import { resolvers } from "./resolvers/order.resolver.js";

// export const createApp = async () => {

//   const app = express();

//   const apolloServer =
//     new ApolloServer({
//       typeDefs,
//       resolvers
//     });

//   await apolloServer.start();

//   app.use(
//     express.json()
//   );

//   app.get(
//     "/health",
//     (_req, res) => {
//       res.json({
//         service: "order-service",
//         status: "UP"
//       });
//     }
//   );

//   app.use(
//     "/graphql",
//     expressMiddleware(
//       apolloServer
//     )
//   );

//   return app;
// };
// import express from "express";

// const app = express();

// app.use(express.json());

// app.get("/health", (_req, res) => {
//   res.json({
//     service: "order-service",
//     status: "UP",
//   });
// });

// export default app;
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";

import { typeDefs } from "./graphql/schema.js";
import { resolvers } from "./resolvers/order.resolvers.js";

const app = express();

const startGraphQL = async () => {
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await apolloServer.start();

  app.use(
    "/graphql",
    express.json(),
    expressMiddleware(apolloServer)
  );
};

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    service: "order-service",
    status: "UP",
  });
});

await startGraphQL();

export default app;
