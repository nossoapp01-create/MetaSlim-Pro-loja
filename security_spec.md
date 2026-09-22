# Security Specification & Test Protocol - Multi-Tenant SaaS Architecture

## 1. Data Invariants & Multi-Tenancy Architecture
- **Tenant Isolation**: Every tenant owns their private collection tree at `/tenants/{tenantId}`.
- **Cross-Tenant Barrier**: A store owner with `request.auth.uid == 'tenant_A'` can ONLY write to `/tenants/tenant_A/...` and is strictly forbidden from writing or listing `/tenants/tenant_B/...`.
- **Tenant Orders Security**: Orders in `/tenants/{tenantId}/orders/{orderId}` can be created by buyers with valid order schemas, but only the tenant owner or the user who placed the order (`userId == request.auth.uid`) or Super Admin (`nossoapp01@gmail.com`) can read or list them.
- **Tenant Catalog**: Public buyers can view products at `/tenants/{tenantId}/products/{productId}`, but only the specific tenant owner can add, modify, or delete products.
- **Tenant Settings**: Public buyers can read store name and payment defaults, but only the tenant owner can update payment gateways or configuration.
- **User Profile Isolation**: `/users/{userId}` is strictly restricted to `request.auth.uid == userId` or Super Admin.
- **All IDs Validation**: Document IDs must pass `isValidId` (`^[a-zA-Z0-9_\-]+$`) with length <= 128.
- **Default Deny**: Global `{document=**}` catch-all blocks all undeclared reads and writes.

## 2. The Dirty Dozen Payloads (Multi-Tenant Test Invariants)
1. **Tenant Cross-Contamination**: Tenant A writing product to `/tenants/tenant_B/products/retatrutide` -> REJECTED (`request.auth.uid != tenant_B`).
2. **Tenant Order Sniffing**: Tenant A listing `/tenants/tenant_B/orders` -> REJECTED (`request.auth.uid != tenant_B`).
3. **Unauthenticated Catalog Wipe**: Unauthenticated DELETE on `/tenants/tenant_A/products/p1` -> REJECTED.
4. **Order Status Hijack by Buyer**: Buyer updating status in `/tenants/tenant_A/orders/ord1` from `pending` to `paid` -> REJECTED (only tenant owner can update orders).
5. **Malicious Payment Gateway Override**: Attacker trying to write to `/tenants/tenant_A/settings/general` -> REJECTED.
6. **Path Traversal / ID Poisoning**: Attacker trying to write to `/tenants/tenant_A/orders/../../root` -> REJECTED by `isValidId`.
7. **Negative Order Amount Injection**: Creating an order with `totalAmount: -200` -> REJECTED by `isValidOrder`.
8. **Unbounded String Resource Exhaustion**: Injecting a 20,000-character description -> REJECTED by size bounds.
9. **Ghost / Malicious Field Injection**: Submitting hidden admin fields into products -> REJECTED by `isValidProduct`.
10. **Cross-Tenant Banner Hijack**: Tenant B updating `/tenants/tenant_A/banners/1` -> REJECTED.
11. **User Profile Sniffing**: Reading `/users/user_B` by `user_A` -> REJECTED.
12. **Catch-All Probe Attack**: Reading `/unknown_collection/secrets` -> REJECTED by default deny.
