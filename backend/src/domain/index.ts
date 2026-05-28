// Domain Entities - Menu
export { Category, type CategoryProps } from './entities/menu/Category.js';
export { MenuItem, type MenuItemProps } from './entities/menu/MenuItem.js';

// Domain Entities - Orders
export { Order, type OrderProps, type CreateOrderProps, type OrderStatus, type OrderType } from './entities/order/Order.js';
export { OrderItem, type OrderItemProps } from './entities/order/OrderItem.js';

// Domain Entities - Reservations
export { Reservation, type ReservationProps, type CreateReservationProps, type ReservationStatus } from './entities/reservation/Reservation.js';

// Domain Entities - Reviews
export { Review, type ReviewProps, type CreateReviewProps } from './entities/review/Review.js';

// Domain Entities - Users
export { User, type UserProps, type CreateUserProps, type UserRole } from './entities/user/User.js';

// Domain Entities - Base
export { Entity } from './entities/base/Entity.js';

// Repository Interfaces
export { type ICategoryRepository, type IMenuItemRepository } from './repositories/ICategoryRepository.js';
export { type IOrderRepository } from './repositories/IOrderRepository.js';
export { type IReservationRepository } from './repositories/IReservationRepository.js';
export { type IReviewRepository } from './repositories/IReviewRepository.js';
export { type IUserRepository } from './repositories/IUserRepository.js';