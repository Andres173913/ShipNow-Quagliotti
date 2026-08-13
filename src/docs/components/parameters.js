export const parameters = {
  countQueryParam: {
    in: "query",
    name: "count",
    schema: {
      type: "integer",
      default: 50,
      minimum: 1
    },
    required: false,
    description: "Cantidad de elementos a generar (máximo 50)"
  },
  idPathParam: {
    in: "path",
    name: "id",
    schema: {
      type: "string"
    },
    required: true,
    description: "ID único del recurso"
  },
  countOrderQueryParam: {
    in: "query",
    name: "count",
    schema: {
      type: "integer",
      default: 10,
        minimum: 1
    },
    required: false,
    description: "Cantidad de pedidos a generar (máximo 10)"
  }
};