# COMPANY API Guide

This guide explains how to use the **Company** endpoints for your CodeIgniter 4 REST API.

All endpoints below are under:

- Base path: `/api/v1`
- Auth: **JWT Bearer token required** (protected by `jwtauth` filter)

---

## Authentication

Send the access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

If the token is missing/invalid, you will get **401 Unauthorized**.

---

## 1) Fetch companies the user belongs to

**Endpoint:**
```
GET /api/v1/companies
```

**Response (200 OK):**

```json
{
  "companies": [
    {
      "id": "<uuid>",
      "name": "Acme Inc",
      "address": "...",
      "phone": "...",
      "email": "acme@example.com",
      "company_code": "A001",
      "created_at": "2026-02-23 10:00:00",
      "updated_at": "2026-02-23 10:00:00",
      "user_type": "owner"
    }
  ]
}
```

Notes:
- `user_type` is from the pivot table `company_users` (example: `owner`, `employee`).

---

## 2) Create a new company (creator becomes owner)

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
