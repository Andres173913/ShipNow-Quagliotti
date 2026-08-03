import { ERROR_CODES } from "./error-codes.js";

export const errorsDictionary = {
    [ERROR_CODES.VALIDATION_ERROR]: {
        statusCode: 400,
        message: 'Los datos enviados no son validos'
    },
    [ERROR_CODES.USER_NOT_FOUND]: {
        statusCode: 404,
        message: 'Usuario no encontrado'
    },
    [ERROR_CODES.ORDER_NOT_FOUND]: {
        statusCode: 404,
        message: 'No se encontro el pedido solicitado'
    },
    [ERROR_CODES.DELIVERY_NOT_FOUND]: {
        statusCode: 404,
        message: 'No se encontro la entrega solicitada'
    },
    [ERROR_CODES.INVALID_ORDER_STATUS]: {
        statusCode: 400,
        message: 'El estado indicado no es valido para un pedido'
    },
    [ERROR_CODES.INVALID_DELIVERY_STATUS]: {
        statusCode: 400,
        message: 'El estado indicado no es valido para una entrega'
    },
    [ERROR_CODES.DRIVER_NOT_AVAILABLE]: {
        statusCode: 409,
        message: 'El repartidor no esta disponible para tomar una entrega'
    },
    [ERROR_CODES.INVALID_MOCK_AMOUNT]: {
        statusCode: 400,
        message: 'La cantidad a generar debe ser un numero positivo'
    },
    [ERROR_CODES.ROUTE_NOT_FOUND]: {
        statusCode: 404,
        message: 'La ruta solicitada no existe'
    },
    [ERROR_CODES.INTERNAL_SERVER_ERROR]: {
        statusCode: 500,
        message: 'Error en el servidor'
    }
};