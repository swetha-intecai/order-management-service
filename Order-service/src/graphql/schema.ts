export const typeDefs = `#graphql

  enum OrderStatus {
    PENDING
    CONFIRMED
    CANCELLED
  }

  type User {
    id: ID!
    name: String!
    email: String!
  }

  type OrderItem {
    id: ID!
    productId: ID!
    quantity: Int!
    price: Float!
  }

  type Order {
    id: ID!
    userId: ID!
    status: OrderStatus!
    items: [OrderItem!]!
    createdAt: String!
    updatedAt: String!
  }

  input CreateOrderItemInput {
    productId: ID!
    quantity: Int!
  }

  input CreateOrderInput {
    userId: ID!
    items: [CreateOrderItemInput!]!
  }

  type OrderConnection {
    orders: [Order!]!
    page: Int!
    limit: Int!
    total: Int!
    hasNextPage: Boolean!
  }

  type Query {
    getOrder(id: ID!): Order

    getUserOrders(
      userId: ID!
      page: Int
      limit: Int
    ): OrderConnection!
  }

  type Mutation {
    createOrder(
      input: CreateOrderInput!
    ): Order!

    cancelOrder(
      id: ID!
    ): Order!

    updateOrderStatus(
      id: ID!
      status: OrderStatus!
    ): Order!
  }
`;