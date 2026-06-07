// Semua message pattern untuk komunikasi antar service via TCP
// API Gateway → Service menggunakan pattern ini

export const AUTH_PATTERNS = {
  REGISTER:         'auth.register',
  LOGIN:            'auth.login',
  REFRESH:          'auth.refresh',
  LOGOUT:           'auth.logout',
  LOGOUT_ALL:       'auth.logout_all',
  SEND_OTP:         'auth.send_otp',
  VERIFY_EMAIL:     'auth.verify_email',
  FORGOT_PASSWORD:  'auth.forgot_password',
  RESET_PASSWORD:   'auth.reset_password',
  GOOGLE_LOGIN:     'auth.google_login',
};

export const USERS_PATTERNS = {
  FIND_BY_ID:       'users.find_by_id',
  UPDATE_PROFILE:   'users.update_profile',
};

export const ORDERS_PATTERNS = {
  GET_MY_ORDERS:    'orders.get_my',
  GET_DETAIL:       'orders.get_detail',
  CANCEL:           'orders.cancel',
};

export const PRODUCTS_PATTERNS = {
  FIND_ALL:         'products.find_all',
  FIND_BY_ID:       'products.find_by_id',
  CREATE:           'products.create',
  UPDATE:           'products.update',
  DELETE:           'products.delete',
};

export const FAVORITES_PATTERNS = {
  GET_MY:           'favorites.get_my',
  ADD:              'favorites.add',
  REMOVE:           'favorites.remove',
  CHECK:            'favorites.check',
};

export const ADDRESSES_PATTERNS = {
  GET_MY:           'addresses.get_my',
  CREATE:           'addresses.create',
  UPDATE:           'addresses.update',
  SET_PRIMARY:      'addresses.set_primary',
  DELETE:           'addresses.delete',
  FIND_ONE:         'addresses.find_one',
};

export const SHIPPING_PATTERNS = {
  GET_ALL:          'shipping.get_all',
  FIND_BY_ID:       'shipping.find_by_id',
  GET_CITIES:       'shipping.get_cities',
};

export const PAYMENTS_PATTERNS = {
  CHECKOUT:         'payments.checkout',
  GET_STATUS:       'payments.get_status',
  WEBHOOK:          'payments.webhook',
};

export const ADMIN_PATTERNS = {
  DASHBOARD:             'admin.dashboard',
  GET_USERS:             'admin.get_users',
  GET_USER_DETAIL:       'admin.get_user_detail',
  TOGGLE_USER:           'admin.toggle_user',
  GET_SELLERS:           'admin.get_sellers',
  REVIEW_SELLER:         'admin.review_seller',
  GET_ORDERS:            'admin.get_orders',
  GET_ORDER_DETAIL:      'admin.get_order_detail',
  UPDATE_ORDER_STATUS:   'admin.update_order_status',
  GET_PRODUCTS:          'admin.get_products',
  TOGGLE_PRODUCT:        'admin.toggle_product',
};

export const NOTIFICATION_PATTERNS = {
  SEND_OTP:           'notification.send_otp',
  SEND_RESET_LINK:    'notification.send_reset_link',
};

// Service names untuk ClientProxy injection token
export const SERVICES = {
  AUTH:         'AUTH_SERVICE',
  USERS:        'USERS_SERVICE',
  ORDERS:       'ORDERS_SERVICE',
  PRODUCTS:     'PRODUCTS_SERVICE',
  FAVORITES:    'FAVORITES_SERVICE',
  ADDRESSES:    'ADDRESSES_SERVICE',
  SHIPPING:     'SHIPPING_SERVICE',
  PAYMENTS:     'PAYMENTS_SERVICE',
  ADMIN:        'ADMIN_SERVICE',
  NOTIFICATION: 'NOTIFICATION_SERVICE',
};
