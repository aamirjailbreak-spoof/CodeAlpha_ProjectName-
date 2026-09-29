# Reusable Engineering & Architectural Profile

> **Document Purpose**: This profile encapsulates the reusable development DNA, architectural patterns, security controls, quality standards, and AI-agent workflows established in this codebase. It serves as an authoritative reference manual for future full-stack web application projects.
>
> *Note on Scope*: Architectural, engineering, security, and process patterns described below are universal rules for high-reliability development. Where specific business domain models are referenced (such as orders, inventory, or cart sessions), they are designated with **[Current project example]** to clearly distinguish reusable foundations from application-specific implementations.

---

## 1. Overall System Architecture

The application adopts a decoupled three-tier architecture emphasizing single responsibility, clear trust boundaries, and zero client-trusted financial or security computation.

```text
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Tier                        │
│         React (Vite) Single-Page Application (SPA)          │
│   • Semantic HTML5 + Accessible Modern CSS (No Tailwind)    │
│   • Client-side validation & immediate UI feedback          │
│   • Centralized API client service (`services/api.js`)      │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON REST
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application / Logic Tier                  │
│                    Node.js + Express REST                   │
│   • Modular route-to-controller mapping                     │
│   • Strict JWT & Key-based Authorization Middleware         │
│   • Server-side business logic & fee calculation engines    │
│   • Transaction management & concurrency isolation          │
│   • Centralized, credential-sanitized error handling        │
└──────────────────────────────┬──────────────────────────────┘
                               │ Parameterized SQL (`pg`)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Persistence Tier                  │
│                     PostgreSQL Relational DB                │
│   • Strong relational integrity (FK cascade/restrict rules) │
│   • Domain CHECK constraints & unique constraints           │
│   • Covered performance indexes on foreign keys             │
│   • Deterministic row-level locking (`FOR UPDATE`)          │
└─────────────────────────────────────────────────────────────┘
```

### Core Architecture Principles
1. **Unilateral Trust Boundary**: The frontend is treated as untrusted. All prices, totals, permissions, stock constraints, and user authorizations are strictly computed and enforced server-side.
2. **Stateless App Servers**: The Express backend maintains zero in-memory session state; all authentication is validated through cryptographically signed JWT tokens or explicit API keys, enabling horizontal scalability.
3. **Database as the Final Authority**: Schema constraints (`CHECK`, `UNIQUE`, `NOT NULL`, `REFERENCES`) act as an immutable barrier against data corruption, ensuring integrity even if application-level checks fail.

---

## 2. Frontend Architecture

### Technology Foundation
- **React 19** with **Vite** as the build and development toolchain.
- **Vanilla CSS3** with a comprehensive CSS Custom Property token system (avoiding heavy utility frameworks like Tailwind for maximal fine-grained aesthetic control and minimal bundle weight).
- **Fast Linting**: Static analysis via `oxlint` ensuring clean imports, zero unhandled errors, and fast CI/CD feedback.

### Component Organization
Components are organized functionally within `frontend/src/`:
- `components/`: UI components categorized into:
  - **Structural / Shell**: Navigation (`Navbar.jsx`), Brand Footer, Hero (`HeroSection.jsx`), Brand Standards (`BrandValues.jsx`).
  - **Domain / Catalog**: Grid container (`ProductGrid.jsx`), Individual display card (`ProductCard.jsx`), Detail modal (`ProductDetailModal.jsx`), Skeletons (`SkeletonCard.jsx`).
  - **Workflow / Transmit Modals**: Cart slide-over (`CartDrawer.jsx`), Multi-step checkout (`CheckoutModal.jsx`), Previous orders receipt viewer (`OrdersModal.jsx`), User authentication (`AuthModal.jsx`), Profile management (`ProfileModal.jsx`).
  - **Shared Design Atoms**: Scalable SVG icon catalog (`Icons.jsx`).
- `context/`: Application-wide reactive state providers (`AuthContext.jsx`, `CartContext.jsx`).
- `services/`: Encapsulated external communication layer (`api.js`).

### State Management Strategy
- **Context API for Global Cross-Cutting Concerns**: Used exclusively where multiple distant components need coordinated access:
  - `AuthContext`: Token persistence, user profile synchronization, login/logout lifecycles.
  - `CartContext`: Current items, calculated subtotal, open/closed drawer visibility, optimistic cart actions.
- **Local State (`useState` / `useReducer`) for Transient Component Logic**: Step counters, input fields, password visibility toggles, modal open states, mouse cursor spotlight tracking.
- **Avoid State Bloat**: Derived values (e.g. `totalItems`, `formattedTotal`) are calculated on the fly during render rather than mirrored in redundant state variables.

### Data Flow
1. User action triggers a service call through context (e.g., `checkout(payload)`).
2. Centralized client (`api.js`) handles token injection, payload serialization, and response normalization.
3. On API success, context updates its state, causing all consuming components to re-render predictably.
4. On API error, structured `ApiError` is caught and surfaced through contextual inline alert banners or floating toasts.

---

## 3. Backend Architecture

### Modular Express Structure
The backend strictly adheres to a three-tier modular pattern:
```text
backend/
├── controllers/    # Business logic, query orchestration, status codes
├── middleware/     # Cross-cutting concerns (auth validation, error handling)
├── routes/         # Clean HTTP method and URL endpoint definitions
├── db.js           # PostgreSQL connection pool with cloud/local auto-sensing
└── server.js       # App entry point, CORS, JSON body limits, route registration
```

### Route-to-Controller Separation
Routes do not execute business logic or database queries directly. They act purely as dispatchers:
```javascript
// Current project example: backend/routes/orderRoutes.js
router.use(authMiddleware);
router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);
```

### Database Connection Pool (`backend/db.js`)
A production-ready database connection strategy must support both local development and cloud hosting seamlessly:
- **Cloud Auto-Sensing**: Inspects `process.env.DATABASE_URL` first. If present, connects via connection string.
- **Conditional SSL Support**: Enables conditional SSL support using DB_SSL or sslmode=require (`rejectUnauthorized: false`) when running in production or when connection strings require it.
- **Local Fallback**: Gracefully falls back to discrete environment variables (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).
- **Connection Reuse**: Uses `pg.Pool` for thread-safe query pipelining and connection recycling.

---

## 4. API Design Standards

### RESTful Conventions
- **Resource Nouns**: Plural nouns for endpoints (`/api/products`, `/api/categories`, `/api/orders`).
- **Standard HTTP Verbs**:
  - `GET`: Safe, idempotent data retrieval.
  - `POST`: Resource creation or workflow execution.
  - `PUT`: Complete resource replacement/update.
  - `DELETE`: Resource removal.
- **Predictable HTTP Status Codes**:
  - `200 OK`: Successful read or update.
  - `201 Created`: Successful resource insertion.
  - `400 Bad Request`: Input validation failure, malformed payload, or domain rule violation.
  - `401 Unauthorized`: Missing, invalid, or expired JWT.
  - `403 Forbidden`: Authenticated user lacks permission (e.g., non-admin mutation).
  - `404 Not Found`: Target ID does not exist or belongs to another user (anti-enumeration).
  - `409 Conflict`: Unique constraint violation (e.g., duplicate email) or foreign key deletion restriction.
  - `500 Internal Server Error`: Unhandled server/database fault.

### Consistent JSON Response Envelopes
Every API endpoint returns a standardized JSON structure:
```json
// Success Response
{
  "success": true,
  "message": "Optional human-readable confirmation",
  "data": { ... }
}

// Error Response
{
  "success": false,
  "message": "Specific, safe error description"
}
```

---

## 5. Security & Authentication Architecture

### 1. Password Storage
- Passwords are never stored plaintext.
- Hashed using **`bcrypt`** with 10 salt rounds before persisting to PostgreSQL.
- Plaintext passwords and `password_hash` fields are strictly excluded from all API response payloads (`SELECT id, name, email ...`).

### 2. JWT Lifecycle & Scope
- Cryptographically signed JSON Web Tokens (`jsonwebtoken`) with configurable expiration (`JWT_EXPIRES_IN=1d`).
- Payload contains minimal non-sensitive identity metadata (`{ userId: user.id }`).
- Validated on incoming requests via [`authMiddleware.js`](file:///c:/Users/Spoof/.gemini/antigravity-ide/scratch/CodeAlpha_EcommerceStore/backend/middleware/authMiddleware.js).
- Header format: `Authorization: Bearer <token>`.

### 3. Enumeration Defense
- Failed authentication returns identical generic error messages: `"Invalid email or password"`.
- Prevents attackers from identifying registered vs. non-registered email addresses through response discrepancies.

### 4. User Isolation & Cross-Tenant Protection
- All user-specific operations (cart management, order history, order details) query data strictly scoped to `req.user.id`.
- Requesting an ID belonging to another user returns `404 Not Found` (rather than `403 Forbidden`) to prevent attackers from discovering valid foreign IDs.

### 5. Mutating Route Lockdown
- Public visitors and ordinary authenticated customers are barred from mutating core catalog data.
- Mutating endpoints (`POST`, `PUT`, `DELETE /api/products`) require elevated authorization (`x-admin-key`), returning `403 Forbidden` if missing.

### 6. SQL Injection & DoS Defense
- 100% of SQL statements utilize parameterized queries (`$1, $2, ...`) through `pg`. Dynamic string interpolation of user input is strictly prohibited.
- Request body sizes are strictly capped via `express.json({ limit: '100kb' })` to mitigate payload flooding attacks.

---

## 6. Database Design & Transaction Integrity

### Relational Integrity & Delete Semantics
Foreign key `ON DELETE` rules are configured with surgical precision based on data permanence:
- **`CASCADE` for Transient/Owned Entities**: User's active cart and cart items cascade on user/cart removal.
- **`SET NULL` for Categorization**: Deleting a category sets `products.category_id = NULL` without destroying the product.
- **`RESTRICT` for Historical Records**:
  - `orders.user_id` has `ON DELETE RESTRICT`: Prevents deleting user accounts that have financial history.
  - `order_items.product_id` has `ON DELETE RESTRICT`: Prevents deleting products that are snapshotted in past customer receipts.

### Concurrency Control & Row-Level Locking
**[Current project example: Checkout Flow]**
To eliminate race conditions, overselling, and deadlock vulnerabilities during concurrent writes:
1. Wrap the workflow in an explicit database transaction: `BEGIN ... COMMIT / ROLLBACK`.
2. Apply deterministic row-level locks on inventory:
   ```sql
   SELECT ... FROM products p WHERE ... ORDER BY p.id ASC FOR UPDATE OF p;
   ```
   *Deterministic ordering (`ORDER BY p.id ASC`) prevents mutual deadlocks when two checkouts reserve overlapping items.*
3. Execute atomic decrements with defensive criteria:
   ```sql
   UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2 AND stock_quantity >= $1;
   ```
4. Snapshot prices: Permanent line items record the historical checkout unit price (`unit_price`) to insulate historical orders from subsequent catalog price updates.

---

## 7. Error Handling & Validation Strategy

### Multi-Tier Defensive Validation
Validation operates at three distinct tiers:

```text
1. Client-Side (Immediate UI Feedback)
   ├── HTML5 attributes (type="email", inputmode="tel", required)
   ├── Regex format checking (email syntax, phone length, non-empty text)
   └── Disabled submit states + loading spinners to block duplicate clicks

2. Controller-Side (Business & Security Defense)
   ├── Type checking (typeof x === 'string')
   ├── Boundary constraints (trimmedLength >= 2 && trimmedLength <= 150)
   ├── Whitelist validation (e.g. delivery_method in ['standard', 'express'])
   └── Normalized transformations (email.trim().toLowerCase())

3. Database-Side (Immutable Safeguard)
   ├── NOT NULL constraints
   ├── UNIQUE constraints (users.email, categories.name, uq_cart_product)
   └── CHECK constraints (price > 0, stock >= 0, quantity > 0, status in (...))
```

### Centralized Error Sanitization
All controller catches delegate to [`errorHandler.js`](file:///c:/Users/Spoof/.gemini/antigravity-ide/scratch/CodeAlpha_EcommerceStore/backend/middleware/errorHandler.js):
- Specific PostgreSQL error codes are translated into clean, client-friendly HTTP responses:
  - `23505` (Unique violation) &rarr; `409 Conflict`
  - `23503` (Foreign key violation) &rarr; `400 Bad Request`
  - `23514` (Check constraint violation) &rarr; `400 Bad Request`
  - `23001` (Restrict constraint violation) &rarr; `409 Conflict`
- Stack traces, internal query syntax, and database credentials are completely stripped from client responses.

---

## 8. UX, Accessibility & Polish Principles

### What Makes This Project Feel Premium & Polished
1. **Zero Layout Shifts**: Pre-allocated skeleton screens (`SkeletonCard.jsx`) and rigid portrait aspect ratios (`aspect-ratio: 4 / 3.4`) prevent cumulative layout shifts (CLS) while remote assets stream in.
2. **Tactile Micro-Interactions**:
   - Liquid Glass Button: Dual-layer inset reflection, ambient glow, and subtle click depression (`scale(0.97)`).
   - Spotlight Cards: Cursor-tracking radial spotlight glow (`--mouse-x`, `--mouse-y`) updated via pure CSS variables on mousemove, avoiding React re-renders.
   - Smooth Drawer Transitions: Slide-over drawer and fade-in modal animations with hardware-accelerated transforms (`transform`, `opacity`).
3. **Tabular Numerals**: Financial pricing and quantity steppers strictly use `font-variant-numeric: tabular-nums` (`.tabular-nums`) to prevent jitter as digits change.
4. **Accessible Feedback**:
   - Keyboard `Escape` closes all modals and drawers.
   - Body scroll locking (`body.modal-open`) eliminates background page scrolling during modal interactions.
   - Accessible `:focus-visible` outlines with high-contrast offsets (`outline-offset: 3px`).
   - Complete `prefers-reduced-motion: reduce` compliance across all transitions.

---

## 9. AI-Agent Development Workflow & Safety Guidelines

### The Reusable 9-Step AI Development Workflow

```text
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│   1. INSPECT    │ ──> │  2. UNDERSTAND   │ ──> │  3. REPORT RISKS   │
└─────────────────┘     └──────────────────┘     └───────────────────┘
                                                           │
                                                           ▼
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│    6. TEST      │ <── │   5. IMPLEMENT   │ <── │ 4. PLAN MINIMAL   │
└─────────────────┘     └──────────────────┘     └───────────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│   7. REGRESSION │ ──> │ 8. REVIEW DIFF   │ ──> │ 9. USER APPROVAL  │
└─────────────────┘     └──────────────────┘     └───────────────────┘
```

1. **Inspect First**: Read live code, schemas, and existing tests before formulating hypotheses.
2. **Understand Scope**: Differentiate between current phase deliverables and future phases. Never jump ahead.
3. **Report Risks Proactively**: If a proposed fix touches security, database data, or external contracts, present the trade-offs before acting.
4. **Plan Minimal, Targeted Changes**: Avoid sprawling refactors. Choose surgical edits that solve the root cause.
5. **Implement Safely**: Use precise replacement tools. Preserve untouched functions, comments, and structure.
6. **Execute Immediate Tests**: Run the targeted test for the modified feature immediately.
7. **Verify Regression**: Run the full suite of preexisting tests (health, auth, catalog, checkout).
8. **Inspect `git diff`**: Confirm zero unintended modifications, debug lines, or untracked test debris.
9. **Await User Approval**: Never commit, push, or reset working trees automatically.

---

## 10. Reusable Project Rules Checklist

Before completing any task, an AI agent must verify:
- [ ] **No Auto-Commits**: Has `git commit` or `git push` been avoided?
- [ ] **No Secret Leaks**: Are `.env` files untracked, and zero passwords/keys printed in outputs?
- [ ] **No Destructive Database Actions**: Were `DROP TABLE`, `TRUNCATE`, or `DROP DATABASE` avoided?
- [ ] **No Fake/Mock Data in Core Flows**: Does the flow connect to real endpoints and real SQL queries?
- [ ] **No Redundant Dependencies**: Was the task solved with existing packages rather than adding unnecessary npm bloat?
- [ ] **No Broken Regression**: Do `/api/health`, `/api/db-test`, and baseline suites pass 100%?
- [ ] **Documentation Kept Synchronized**: Was `README.md` updated if endpoints, environment variables, or workflows changed?

---

## 11. Anti-Patterns to Avoid

| Anti-Pattern | Why It Is Dangerous | What This Project Does Instead |
|---|---|---|
| **Broad Framework Rewrites** | Introducing Tailwind, Next.js, or complex ORMs mid-project destroys working CSS and introduces dependency debt. | Uses standard modular Express and Vanilla CSS tokens with zero bloat. |
| **Client-Trusted Calculations** | Accepting `total_amount` or `delivery_fee` sent from the browser allows checkout tampering. | The backend recalculates all subtotals, fees, and totals from database unit prices. |
| **Destructive Schema Reset** | Running `DROP TABLE` or recreating the database to apply schema changes wipes live customer history. | Non-destructive schema migrations (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`). |
| **Mocking Passing Tests** | Mocking database calls or overriding test files to make tests turn green hides real bugs. | Tests run against the live PostgreSQL instance and clean up their own test rows deterministically. |
| **Unrestricted Mutating APIs** | Leaving `POST/PUT/DELETE` open to anonymous users invites catastrophic data loss. | Mutating routes are locked behind administrative authorization headers. |

---

## Source Files Inspected

- `backend/server.js`
- `backend/db.js`
- `backend/routes/productRoutes.js`
- `backend/routes/orderRoutes.js`
- `backend/routes/cartRoutes.js`
- `backend/routes/authRoutes.js`
- `backend/routes/userRoutes.js`
- `backend/routes/categoryRoutes.js`
- `backend/controllers/orderController.js`
- `backend/controllers/cartController.js`
- `backend/controllers/authController.js`
- `backend/controllers/productController.js`
- `backend/controllers/userController.js`
- `backend/controllers/categoryController.js`
- `backend/middleware/authMiddleware.js`
- `backend/middleware/errorHandler.js`
- `database/schema.sql`
- `database/migrations/001_add_checkout_fields.sql`
- `frontend/src/App.jsx`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/context/CartContext.jsx`
- `frontend/src/services/api.js`
- `frontend/src/components/CheckoutModal.jsx`
- `frontend/src/components/CartDrawer.jsx`
- `frontend/src/components/ProductCard.jsx`
- `frontend/src/components/OrdersModal.jsx`
- `frontend/src/components/Navbar.jsx`
- `backend/test_categories.js`
- `backend/test_flows.js`
- `backend/test_checkout_comprehensive.js`
- `README.md`
