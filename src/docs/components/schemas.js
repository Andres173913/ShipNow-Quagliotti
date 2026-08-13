import { USER_ROLES } from "../../constants/roles.js";

export const schemas = {
  Health: {
    type: "object",
    properties: {
      service: {
        type: "string",
        example: "ShipNow API"
      },
      environment: {
        type: "string",
        example: "development"
      },
    }
  },
  User: {
    type: "object",
    description: "Password never returned in response",
    properties: {
      _id: {
        type: "string",
        example: "64a2b1c3d4e5f6a7b8c9d0e1"
      },
      first_name: {
        type: "string",
        example: "Coder"
      },
      last_name: {
        type: "string",
        example: "House"
      },
      email: {
        type: "string",
        format: "email",
        example: "coder.house@example.com"
      },
      role: {
        type: "string",
        enum: Object.values(USER_ROLES),
        example: "admin"
      }
    }
  },
  UserCreateRequest: {
    type: "object",
    required: ["first_name", "last_name", "email", "password"],
    properties: {
      first_name: {
        type: "string",
        example: "Coder"
      },
      last_name: {
        type: "string",
        example: "House"
      },
      email: {
        type: "string",
        format: "email",
        example: "coder.house@example.com"
      },
      role: {
        type: "string",
        enum: Object.values(USER_ROLES),
        example: "admin"
      },
      password: {
        type: "string",
        format: "password",
        example: "1234"
      }
    }
  },
  Product: {
    type: "object",
    description: "Representa un producto en el inventario del sistema",
    properties: {
      _id: {
        type: "string",
        example: "64a2b1c3d4e5f6a7b8c9d0e2"
      },
      title: {
        type: "string",
        example: "Kit de Envíos Express"
      },
      description: {
        type: "string",
        example: "Caja estandarizada para envíos rápidos de paquetería"
      },
      price: {
        type: "number",
        example: 1500.50
      },
      stock: {
        type: "integer",
        example: 100
      },
      category: {
        type: "string",
        example: "Embalaje"
      },
      code: {
        type: "string",
        example: "EXPRESS-KIT-001"
      }
    }
  },
  ProductCreateRequest: {
    type: "object",
    required: ["title", "price", "stock"],
    properties: {
      title: {
        type: "string",
        example: "Kit de Envíos Express"
      },
      description: {
        type: "string",
        example: "Caja estandarizada para envíos rápidos de paquetería"
      },
      price: {
        type: "number",
        example: 1500.50
      },
      stock: {
        type: "integer",
        example: 100
      },
      category: {
        type: "string",
        example: "Embalaje"
      },
      code: {
        type: "string",
        example: "EXPRESS-KIT-001"
      }
    }
  },
  Order: {
    type: "object",
    description: "Representa una orden o pedido en el sistema de envíos",
    properties: {
      _id: {
        type: "string",
        example: "64a2b1c3d4e5f6a7b8c9d0e3"
      },
      client: {
        type: "string",
        example: "64a2b1c3d4e5f6a7b8c9d0e1"
      },
      courier: {
        type: "string",
        example: "64a2b1c3d4e5f6a7b8c9d0e9"
      },
      status: {
        type: "string",
        enum: ["pending", "accepted", "delivered", "cancelled"],
        example: "pending"
      },
      total_price: {
        type: "number",
        example: 3500.00
      },
      delivery_address: {
        type: "string",
        example: "Av. Pellegrini 1234, Rosario"
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
    description: "Pedido procesado/encontrado exitosamente",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/Order"
        }
      }
    }
  },
  MockGenerateRequest: {
    type: "object",
    properties: {
      usersCount: { type: "integer", example: 50 },
      productsCount: { type: "integer", example: 20 },
      ordersCount: { type: "integer", example: 10 }
    }
  },
  CartItem: {
    type: "object",
    description: "Representa un producto dentro del carrito de compras",
    properties: {
      product: {
        $ref: "#/components/schemas/Product"
      },
      quantity: {
        type: "integer",
        example: 2
      }
    }
  },
  Cart: {
    type: "object",
    description: "Representa el carrito de compras del usuario",
    properties: {
      _id: {
        type: "string",
        example: "64a2b1c3d4e5f6a7b8c9d0e5"
      },
      user: {
        type: "string",
        example: "64a2b1c3d4e5f6a7b8c9d0e1"
      },
      products: {
        type: "array",
        items: {
          $ref: "#/components/schemas/CartItem"
        }
      }
    }
  },
  CartAddRequest: {
    type: "object",
    required: ["productId", "quantity"],
    properties: {
      productId: {
        type: "string",
        example: "64a2b1c3d4e5f6a7b8c9d0e2"
      },
      quantity: {
        type: "integer",
        example: 1
      }
    }
  }
};