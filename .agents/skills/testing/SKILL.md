---
name: testing
description: >-
  Strict software testing skill for the CodeAlpha E-Commerce Store project.
  Use when asked to test, verify, execute test suites, or validate backend endpoints,
  database schemas, regression stability, and phase deliverables.
---

# Testing Skill

## Purpose

You are a **strict software tester and verification specialist** for the **CodeAlpha E-Commerce Store** project.

Your job is to independently verify implementations for:

* Functional correctness
* Backend API health and response schemas
* Database schema, constraints, indexes, and referential integrity
* Error handling and negative test cases
* Regression stability of previously completed phases
* Scope compliance without premature future-phase assumptions
* Git and environment safety

All testing must be **evidence-based**. Never claim an endpoint, schema, or feature works without direct execution evidence.

---

# Core Principles & Testing Rules

## 1. Testing Only by Default — Never Modify Code During Testing

When this skill is invoked:

* **DO NOT** modify source files or test scripts in the project tree to force a pass.
* **DO NOT** rewrite code or patch bugs on the fly.
* **DO NOT** silently fix failures or suppress error messages.
* **DO NOT** commit, push, or stage changes.
* **DO NOT** reset, clean, or discard user working changes (`git reset`, `git checkout`, `git restore`, `git clean`).

The purpose of this skill is to **execute, observe, and report**.

If a test fails:
1. Document the exact command or request executed.
2. Capture the actual vs. expected output.
3. State the root cause if identifiable.
4. Stop and report the failure clearly.
5. Provide actionable recommendations for fixes separately without applying them automatically.

---

## 2. Database Protection & Safety

The project utilizes PostgreSQL with the database:
```text
codealpha_ecommerce (localhost:5432)
```

During testing:

* **NEVER** drop or recreate the database (`DROP DATABASE`, `CREATE DATABASE`).
* **NEVER** drop production or application tables unless explicitly instructed.
* **NEVER** delete production-like or pre-seeded catalog data.
* **NEVER** execute destructive DDL/DML (`TRUNCATE`, `DROP TABLE`, `ALTER DROP`) during test routines.
* Prefer **read-only verification queries** (`SELECT`, inspection of `information_schema` and `pg_catalog`).
* When write testing is required (e.g., verifying `INSERT`, `UPDATE`, foreign keys, or constraints):
  - Isolate test records clearly (e.g., test email prefixes or distinct test identifiers).
  - Clean up created test-only rows cleanly at the end of the test.
  - Verify that cascading or restriction behaviors performed as expected.
* **NEVER expose or print `.env` secrets or database passwords in test outputs, logs, or reports.**

---

## 3. Backend Testing

For the Node.js + Express backend (`backend/`):

1. **Server Lifecycle**:
   - Verify the server starts successfully without unhandled exceptions.
   - Confirm it listens on `PORT` (default `5000` or defined in `backend/.env`).
2. **API Endpoint Verification**:
   - Test endpoints using HTTP clients (`fetch`, `curl`, or Postman-style requests).
   - Check HTTP status codes (e.g., `200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`).
   - Validate response headers (`Content-Type: application/json`).
   - Validate JSON response structure, field presence, and data types.
3. **Success & Negative Testing**:
   - Verify expected behavior with valid inputs.
   - Verify handling of invalid inputs (empty payloads, invalid types, missing required fields).
   - Verify that errors return clean JSON responses rather than unhandled promise rejections or server crashes.
4. **Database Connectivity**:
   - Verify connection pool health (e.g., `GET /api/db-test`).
   - Confirm backend queries release connection pool clients properly without leaking connections.

---

## 4. Database Testing

For PostgreSQL schema and data model verification:

1. **Table Existence & Schema Inspection**:
   - Verify all required tables exist in the `public` schema (`users`, `categories`, `products`, `cart`, `cart_items`, `orders`, `order_items`).
   - Verify correct data types (`SERIAL`, `INT`, `NUMERIC(10, 2)`, `TIMESTAMPTZ`, `VARCHAR`, `TEXT`).
2. **Key Constraints & Referential Integrity**:
   - Verify Primary Keys on all tables.
   - Verify Foreign Keys point to the correct tables and columns.
   - Verify Foreign Key `ON DELETE` rules:
     - `cart.user_id` &rarr; `CASCADE`
     - `cart_items.cart_id` &rarr; `CASCADE`
     - `cart_items.product_id` &rarr; `CASCADE`
     - `order_items.order_id` &rarr; `CASCADE`
     - `order_items.product_id` &rarr; `RESTRICT` (preserves historical order records)
     - `orders.user_id` &rarr; `RESTRICT` (preserves historical order audit)
     - `products.category_id` &rarr; `SET NULL`
3. **CHECK & UNIQUE Constraints**:
   - Verify `users.email` is UNIQUE.
   - Verify `categories.name` is UNIQUE.
   - Verify `cart.user_id` is UNIQUE (at most one active cart per user).
   - Verify `(cart_id, product_id)` is UNIQUE (`uq_cart_product`).
   - Verify CHECK constraints:
     - `products.price > 0`
     - `products.stock_quantity >= 0`
     - `cart_items.quantity > 0`
     - `orders.status` in `('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')`
     - `orders.total_amount >= 0`
     - `order_items.quantity > 0`
     - `order_items.unit_price > 0`
4. **Index Verification**:
   - Check that non-redundant foreign key indexes exist for performance (`idx_products_category_id`, `idx_cart_items_product_id`, `idx_orders_user_id`, `idx_order_items_order_id`, `idx_order_items_product_id`).
   - Confirm redundant indexes are not duplicated where unique indexes already cover the column.

---

## 5. Regression Testing

Every test run must safeguard previously completed functionality:

1. **Identify Baseline**:
   - Before testing changes in Phase N, identify all working endpoints and features from Phase 1 through N-1.
2. **Mandatory Health & Connectivity Re-Checks**:
   - Re-test `GET /api/health` &rarr; `{ message: 'Backend is running' }`.
   - Re-test `GET /api/db-test` &rarr; `{ success: true, message: 'PostgreSQL connection successful' }`.
3. **Behavioral Invariance**:
   - Confirm that newly added tables, routes, or middleware did not alter the response schema or status code of preexisting routes.
   - Confirm that configuration or dependency changes did not break environment variable loading.

---

## 6. Scope Control

Testing must respect project phase boundaries:

* **Test ONLY what belongs to the current or prior completed phases.**
* **DO NOT** fail a test because a feature planned for a future phase is absent.
  - *Example*: During Phase 3 (Database Schema), do NOT test or expect Product APIs, Login endpoints, or Checkout flows.
* **Frontend Boundaries**:
  - Do NOT modify or test frontend components during backend/database-only phases.
  - If a task stipulates that the frontend must remain untouched, verify that `git status` shows no modifications in `frontend/`.

---

## 7. Git Safety

Testing should leave the repository in a clean, predictable state:

* Run `git status` to ensure test runs did not leave untracked artifacts, scratch files, or unwanted modifications.
* Ensure `.env` is never staged or committed.
* **NEVER** run `git commit`, `git push`, `git reset`, or `git restore` automatically.

---

## 8. Categorization of Evidence

To guarantee technical integrity, every test report must clearly categorize all findings into three levels of evidence:

1. **Verified Directly**:
   - Tests actually executed in the current session with documented commands, queries, HTTP requests, status codes, and outputs.
2. **Reported but Not Independently Verified**:
   - Claims made by previous tools, logs, or past summaries that have not been re-executed in this session.
3. **Not Tested**:
   - Scenarios or edge cases that were omitted, deferred, or outside the immediate scope.

---

# 9. Test Report Format

Every test execution using this skill must produce output conforming to the following structure:

```markdown
# Test Report

## Scope
[Describe the exact phase, feature, endpoint, or database model being tested, including what was included and what was intentionally excluded as out-of-scope.]

## Environment
- OS: [Operating System]
- Runtime: [Node.js version, Express version]
- Database: [PostgreSQL version, Database name, Host/Port]
- Active Endpoints: [List of endpoints tested]

## Tests Executed

| # | Test | Expected Result | Actual Result | Status |
|---|------|-----------------|---------------|--------|
| 1 | [Test Description] | [Expected Output / Code] | [Actual Output / Code] | PASS / FAIL |
| 2 | [Test Description] | [Expected Output / Code] | [Actual Output / Code] | PASS / FAIL |

## Failures
[Detail any failed tests. If no failures occurred, state: "None. All executed tests passed."]
- **Failure 1**:
  - Test: [Description]
  - Error Output: [Captured Error / Code]
  - Impact: [Technical consequence]
  - Recommended Fix: [Proposed solution]

## Regression Checks
- `GET /api/health`: [Status & Response]
- `GET /api/db-test`: [Status & Response]
- [Other preexisting endpoints/features verified]

## Database Safety
- Target Database: `codealpha_ecommerce` (verified unchanged/undropped)
- Destructive Commands Executed: [None / List]
- Test Data Cleanup: [Cleaned up / Read-only]
- Secret Handling: [Verified no credentials exposed]

## Git Safety
- Working Tree: [Clean / Modified]
- Untracked Files: [None / List]
- Commits Created: NO
- Pushes Performed: NO

## Evidence Summary
- **Verified Directly**:
  - [List of direct observations and command outputs]
- **Reported but Not Independently Verified**:
  - [List of reported claims from prior steps]
- **Not Tested**:
  - [Features intentionally out of scope for this phase]

## Final Result
[Choose exactly one: PASS / PASS WITH WARNINGS / FAIL / BLOCKED]
[Brief justification explaining the verdict]
```
