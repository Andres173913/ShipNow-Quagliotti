export const ORDER_STATUS = Object.freeze({
  PENDING: 'PENDING',       // El cliente pagó, falta preparar
  PREPARING: 'PREPARING',   // El negocio está armando el paquete
  READY: 'READY',           // Listo para que lo retire un repartidor
  IN_TRANSIT: 'IN_TRANSIT', // El COURIER lo tiene en su vehículo y va en camino
  DELIVERED: 'DELIVERED',   // El COURIER ya lo entregó al cliente
  CANCELLED: 'CANCELLED'    // Cancelado
});