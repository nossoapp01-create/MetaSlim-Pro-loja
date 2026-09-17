# Security Specification & Test Protocol

## 1. Data Invariants
- Catalog products (`/products/{productId}`) are readable by anyone (public store catalog), but writes/deletions must be strictly restricted to authenticated administrators (`isAdmin()`).
- Banners (`/banners/{bannerId}`) are publicly viewable, but create/update/delete restricted to administrators.
- Testimonials (`/testimonials/{testimonialId}`) are publicly viewable, but create/update/delete restricted to administrators.
- Settings (`/settings/{settingId}`) are publicly readable, write restricted to administrators.
- Orders (`/orders/{orderId}`) can be created by authenticated users or checkout guests with valid payload bounds, and read only by the owner or administrator.
- All IDs must pass `isValidId` regex (`^[a-zA-Z0-9_\-]+$`) with length <= 128.
- Super Admin email: `nossoapp01@gmail.com`.

## 2. The Dirty Dozen Payloads
1. **Unauthenticated Product Overwrite**: Write to `/products/retatrutide-10mg` without auth -> REJECTED.
2. **Ghost Field Injection in Product**: Write product with hidden malicious field `__isAdmin: true` -> REJECTED.
3. **Price Manipulation to Negative Value**: Write product with `price: -50.00` -> REJECTED.
4. **Huge String DOS in Product Title**: Write title with 10,000 characters -> REJECTED.
5. **ID Poisoning in Product Path**: Write to `/products/../../root` or illegal characters -> REJECTED.
6. **Unauthenticated Banner Tampering**: Delete `/banners/1` without auth -> REJECTED.
7. **Malicious Settings Hijack**: Override `defaultPaymentLink` to phishing domain by unauthenticated user -> REJECTED.
8. **Testimonial Fake Creator Injection**: Update testimonial quote without admin token -> REJECTED.
9. **Order Identity Spoofing**: User A creating order with `userId: "user_B"` claiming someone else's order -> REJECTED.
10. **Order Negative Total Amount**: Create order with `totalAmount: -100` -> REJECTED.
11. **Order Status Tampering**: Non-admin user updating order status from `pending` to `paid` -> REJECTED.
12. **Catch-All Probe Attack**: Reading `/unknown_collection/secrets` -> REJECTED by global default deny.
