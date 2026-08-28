export const responses = {
  HealthResponse: {
    description: "Response for health check endpoint",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/Health" 
        }
      }
    }
  },
  UsersListResponse: {
    description: "Lista de usuarios",
    content: {
      "application/json": {
        schema: {
          type: "array",
          items: {
            $ref: "#/components/schemas/User"
          }
        }
      }
    }
  },
  UserCreateResponse: {
    description: "Response for user creation endpoint",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/User"
        }
      }
    }
  },
  BadRequestResponse: {
    description: "Bad Request response",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Invalid request data"
            }
          }
        }
      }
    }
  },
  ConflictResponse: {
    description: "Conflict response",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Resource already exists"
            }
          }
        }
      }
    }
  },
  UnauthorizedResponse: {
    description: "Unauthorized response",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Unauthorized access"
            }
          }
        }
      }
    }
  },
  ForbiddenResponse: {
    description: "Forbidden response",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Access denied"
            }
          }
        }
      }
    }
  },
  InternalServerErrorResponse: {
    description: "Internal Server Error response",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "An internal server error occurred"
            }
          }
        }
      }
    }
  },
  ProductsListResponse: {
    description: "Lista de productos obtenida exitosamente",
    content: {
      "application/json": {
        schema: {
          type: "array",
          items: {
            $ref: "#/components/schemas/Product"
          }
        }
      }
    }
  },
  ProductCreateResponse: {
    description: "Producto creado exitosamente",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/Product"
        }
      }
    }
  },
  ProductSingleResponse: {
    description: "Producto encontrado exitosamente",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/Product"
        }
      }
    }
  },
  OrdersListResponse: {
    description: "Lista de pedidos obtenida exitosamente",
    content: {
      "application/json": {
        schema: {
          type: "array",
          items: {
            $ref: "#/components/schemas/Order"
          }
        }
      }
    }
  },
  OrderSingleResponse: {
    description: "Pedido procesado exitosamente",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/Order"
        }
      }
    }
  },
  TextResponse: {
    description: "Respuesta en formato texto",
    content: {
      "text/plain": {
        schema: {
          type: "string"
        }
      }
    }
  },
  MockSuccessResponse: {
    description: "Operación de mock completada exitosamente",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Data generated and saved successfully"
            }
          }
        }
      }
    }
  },
  CartSingleResponse: {
    description: "Carrito procesado exitosamente",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/Cart"
        }
      }
    }
  }
};