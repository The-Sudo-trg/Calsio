/** Shared API payload types (mirrors apps/api responses). */

export type Category = 'SNEAKERS' | 'LOAFERS' | 'SANDALS' | 'FORMAL';
export type Gender = 'MEN' | 'WOMEN' | 'UNISEX';

export type ProductImage = { url: string; alt: string | null };

export type ProductListItem = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  gender: Gender;
  price: number;
  mrp: number;
  colorway: string | null;
  occasion: string | null;
  isCodEnabled: boolean;
  image: ProductImage | null;
  ratingAvg: number | null;
  reviewCount: number;
};

export type ProductsResponse = {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type Variant = {
  id: string;
  sku: string;
  size: string;
  colorName: string;
  stock: number;
};

export type PdpProduct = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  gender: Gender;
  description: string;
  descriptionHi: string | null;
  craftStory: string;
  price: number;
  mrp: number;
  material: string | null;
  occasion: string | null;
  colorway: string | null;
  isCodEnabled: boolean;
  images: ProductImage[];
  variants: Variant[];
  reviews: { id: string; rating: number; text: string; customer: { name: string | null } }[];
};

export type Eta = {
  pincode: string;
  minDays: number;
  maxDays: number;
  metroFast: boolean;
  message: string;
  codAvailable: boolean;
};

export type OrderItem = {
  quantity: number;
  unitPrice: number;
  variant: { sku: string; size: string; colorName: string; product: { slug: string; name: string } };
};

export type Order = {
  id: string;
  status: 'PLACED' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  shippingFee: number;
  total: number;
  placedAt: string;
  items: OrderItem[];
  payment: { method: string; status: string } | null;
  returnReq: { status: string } | null;
};

export type CheckoutResult = {
  ok: boolean;
  orderId: string;
  total: number;
  method: 'UPI' | 'COD';
  mockPaid: boolean;
  message: string;
};
