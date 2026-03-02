# COMPANY API Guide

This guide explains how to use the **Company** endpoints for your CodeIgniter 4 REST API.

---

## Important: API Token Required

All `/api/v1/companies` endpoints require the `X-API-Token` header in every request, in addition to the JWT Bearer token.

## 2) Create a company

**Endpoint:**
Headers:
  X-API-Token: <your_api_token>
  Authorization: Bearer <access_token>
  Content-Type: application/json
```

If the token is missing or invalid, you will get **401 Unauthorized**.

---

  "plan_id": "<uuid-from-GET-/api/v1/plans>",
  "billing_cycle": "monthly",
---

## Authentication


Required for this flow:
- `plan_id` (required): selected plan ID from `GET /api/v1/plans`
- `billing_cycle` (optional): `monthly` or `yearly` (defaults to `monthly`)
Send the access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```
  "company_id": "<uuid>",
  "plan_id": "<uuid>",
  "billing_cycle": "monthly"
If the token is missing/invalid, you will get **401 Unauthorized**.

---

## 1) Fetch companies the user belongs to
- Creates an initial row in `company_subscriptions` using the chosen plan and billing cycle.

**Endpoint:**
```
GET /api/v1/companies
```

**Response (200 OK):**

```json
{
  "companies": [
    {
      "company": {
        "id": "<uuid>",
        "name": "Acme Inc",
        "address": "...",
        "phone": "...",
        "email": "acme@example.com",
        "company_code": "A001",
        "created_at": "2026-02-23 10:00:00",
        "updated_at": "2026-02-23 10:00:00"
      },
      "user_type": "owner",
      "subscription": {
        "id": "<subscription_uuid>",
        "plan_id": "<plan_uuid>",
        "plan_name": "Start",
        "plan_description": "Basic plan for small teams",
        "billing_cycle": "monthly",
        "amount": "75.00",
        "currency": "MYR",
        "start_date": "2026-03-02 14:55:51",
        "end_date": "2026-04-02 14:55:51",
        "status": "active",
        "payment_method": null,
        "provider": null,
        "provider_ref": null
      }
    }
  ]
}
```

Notes:
- `user_type` is from the pivot table `company_users` (example: `owner`, `employee`).

---

## 1.5) Fetch single company by ID

**Endpoint:**
```
GET /api/v1/companies/{company_id}
```

**Authorization:**
- User must be part of this company (have any role: `owner`, `manager`, or `employee` in `company_users`)
- Returns 403 Forbidden if user doesn't have access

**Response (200 OK):**

```json
{
  "company": {
    "id": "cc57a2ea-b82d-4cf1-9f09-7776e6ea6ca6",
    "name": "KEL COMPUTER STATION SDN BHD",
    "address": "SUITE 3-4\nWISMA ABRAR INTERNATIONAL\n13050 KOTA BHARU, KELANTAN",
    "phone": "+60923849234",
    "email": "admin@kcs.com.my",
    "company_code": "K001",
    "created_at": "2026-03-02 14:55:51",
    "updated_at": "2026-03-02 14:55:51",
    "status": "active",
    "registered_address": null,
    "business_address": null,
    "shareholders": null,
    "directores": null,
    "company_no": null,
    "registered_date": null,
    "paidup_capital": null,
    "authorized_capital": null
  },
  "user_type": "owner",
  "subscription": {
    "id": "c40b349b-00c1-4ded-9562-b09f5bb3473b",
    "plan_id": "7c0b2f1e-4b8a-4d1d-9d6b-1f4d2c9a7a31",
    "plan_name": "Start",
    "plan_description": "Basic plan for small teams",
    "billing_cycle": "yearly",
    "amount": "75.00",
    "currency": "MYR",
    "start_date": "2026-03-02 14:55:51",
    "end_date": "2027-03-02 14:55:51",
    "status": "active",
    "payment_method": null,
    "provider": null,
    "provider_ref": null
  }
}
```

Returns 404 if company not found.

---

**Endpoint:**
```
POST /api/v1/companies
```

**Request Body (JSON):**

```json
{
  "name": "Acme Inc",
  "email": "acme@example.com",
  "address": "Optional address",
  "phone": "Optional phone"
}
```

**Response (201 Created):**

```json
{
  "message": "Company created",
  "company_id": "<uuid>"
}
```

Behavior:
- Creates a row in `companies`.
- Inserts a row into `company_users` with:
  - `user_id` = authenticated user
  - `company_id` = newly created company
  - `user_type` = `owner`
- Multiple companies can share the same email (email is **not** unique).
- `company_code` is auto-generated and must be unique (e.g., A001, S002).

---

## 3) Update a company

**Endpoint(s):**
```
PUT   /api/v1/companies/{company_id}
PATCH /api/v1/companies/{company_id}
```

**Authorization:**
- User must be an `owner` **or** `manager` of this company (checked via `company_users` table)
- Returns 403 Forbidden if user doesn't have permission

**Allowed fields:**
- `name`
- `address`
- `phone`
- `email`
- `company_code`

**Request Body (JSON) example:**

```json
{
  "phone": "011-222333",
  "address": "New address"
}
```

**Response (200 OK):**

```json
{
  "message": "Company updated"
}
```

If no fields are provided (or nothing changed), you may receive:

```json
{
  "message": "No changes"
}
```

---

## 4) Delete a company

**Endpoint:**
```
DELETE /api/v1/companies/{company_id}
```

**Authorization:**
- User must be the `owner` of this company (checked via `company_users` table)
- Returns 403 Forbidden if user is not the owner

**Response (200 OK):**

```json
{
  "message": "Company deleted"
}
```

Behavior:
- Deletes related pivot rows from `company_users` (by `company_id`).
- Deletes the company row.

---

## Error Responses

### 401 Unauthorized
Token missing/invalid:

```json
{
  "error": "Authorization header missing"
}
```

or

```json
{
  "error": "Invalid or expired token"
}
```

### 404 Not Found
Company does not exist:

```json
{
  "messages": "Company not found"
}
```

### 422 Validation error
Example:

```json
{
  "messages": {
    "email": "The email field must contain a valid email address."
  }
}
```

---

## Security Notes

- Use HTTPS in production.
- Currently, the API only requires a valid JWT to update/delete companies.
  - If you want **only owners** to update/delete, add an authorization check against `company_users`.
