const appendQuery = (
  path: string,
  params?: Record<string, string | undefined>,
) => {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) {
      searchParams.append(key, value);
    }
  });

  const queryString = searchParams.toString();
  return `${path}${queryString ? `?${queryString}` : ''}`;
};

export const BRAND_ENDPOINTS = {
  list: (params?: { search?: string }) =>
    appendQuery('/customer/api/brand-list/', params),
};

export const ACCOUNT_ENDPOINTS = {
  firebaseLogin: '/account/firebase-login/',
  signup: '/account/api/signup/',
};

export const PRODUCT_ENDPOINTS = {
  bestsellers: (params?: { search?: string }) =>
    appendQuery('/customer/api/bestsellers/', params),
  details: (id: string | number) => `/customer/api/products/${id}/`,
  list: (params?: {
    category?: string;
    search?: string;
    brand?: string;
    business?: string;
  }) => appendQuery('/customer/api/products/', params),
};

export const CATEGORY_ENDPOINTS = {
  list: () => '/customer/api/category-list/',
};

export const WISHLIST_ENDPOINTS = {
  list: () => '/customer/api/wishlist/',
  remove: (id: string | number) => `/customer/api/wishlist/${id}/`,
};

export const CART_ENDPOINTS = {
  list: () => '/customer/api/cart/',
  add: () => '/customer/api/cart/add/',
  checkout: () => '/customer/api/checkout/',
  remove: (id: string | number) => `/customer/api/cart/${id}/remove/`,
};

export const ORDER_ENDPOINTS = {
  list: () => '/customer/api/orders/',
  detail: (orderId: string | number) => `/customer/api/orders/${orderId}/`,
};

export const SUPPORT_ENDPOINTS = {
  faqs: () => '/customer/api/faqs/',
  tickets: () => '/api/support-tickets/',
  ticketById: (id: string | number) => `/api/support-tickets/${id}/`,
  sendMessage: (id: string | number) => `/api/support-tickets/${id}/`,
  createTicket: () => '/api/support-tickets/',
};

export const VENDOR_ENDPOINTS = {
  list: (params?: { search?: string }) =>
    appendQuery('/customer/api/businesses/', params),
  detail: (id: string | number) => `/customer/api/businesses/${id}/`,
  banners: () => '/vendor/api/banners/',
};

export const REVIEW_ENDPOINTS = {
  product: (id: string | number, params?: { search?: string }) =>
    appendQuery(`/customer/api/reviews/${id}/`, params),
};

export const PROFILE_ENDPOINTS = {
  me: () => '/account/api/profile/',
};

export const NOTIFICATION_ENDPOINTS = {
  list: () => '/account/api/notifications/',
};

export const ADDRESS_ENDPOINTS = {
  list: () => '/customer/api/delivery-addresses/',
  update: (id: string | number) => `/customer/api/delivery-addresses/${id}/`,
};

export const PROJECT_ENDPOINTS = {
  list: () => '/customer/api/projects/',
  detail: (id: string | number) => `/customer/api/projects/${id}/`,
  assign: (projectId: string | number) =>
    `/customer/api/projects/${projectId}/assign/`,
  products: (id: string | number) => `/customer/api/projects/${id}/products/`,
};

const endpoints = {
  brand: BRAND_ENDPOINTS,
  account: ACCOUNT_ENDPOINTS,
  product: PRODUCT_ENDPOINTS,
  category: CATEGORY_ENDPOINTS,
  wishlist: WISHLIST_ENDPOINTS,
  cart: CART_ENDPOINTS,
  order: ORDER_ENDPOINTS,
  support: SUPPORT_ENDPOINTS,
  vendor: VENDOR_ENDPOINTS,
  review: REVIEW_ENDPOINTS,
  profile: PROFILE_ENDPOINTS,
  notification: NOTIFICATION_ENDPOINTS,
  address: ADDRESS_ENDPOINTS,
  project: PROJECT_ENDPOINTS,
  auth: ACCOUNT_ENDPOINTS,
};

export default endpoints;
