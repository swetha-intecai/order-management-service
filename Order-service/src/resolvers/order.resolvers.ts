export const resolvers = {

  Query: {

    getOrder: async (
      _parent: unknown,
      args: { id: string }
    ) => {

      console.log(
        "getOrder:",
        args.id
      );

      return null;
    },

    getUserOrders: async (
      _parent: unknown,
      args: {
        userId: string;
        page?: number;
        limit?: number;
      }
    ) => {

      console.log(
        "getUserOrders:",
        args
      );

      return {
        orders: [],
        page: args.page ?? 1,
        limit: args.limit ?? 10,
        total: 0,
        hasNextPage: false
      };
    }
  },

  Mutation: {

    createOrder: async (
      _parent: unknown,
      args: unknown
    ) => {

      console.log(
        "createOrder:",
        args
      );

      throw new Error(
        "createOrder is not implemented yet"
      );
    },

    cancelOrder: async (
      _parent: unknown,
      args: { id: string }
    ) => {

      console.log(
        "cancelOrder:",
        args.id
      );

      throw new Error(
        "cancelOrder is not implemented yet"
      );
    },

    updateOrderStatus: async (
      _parent: unknown,
      args: unknown
    ) => {

      console.log(
        "updateOrderStatus:",
        args
      );

      throw new Error(
        "updateOrderStatus is not implemented yet"
      );
    }
  }
};