# User Profile API Guide

This guide documents the **User Profile** endpoints:

- `GET /api/v1/profile` → `UserProfile::getProfile`
- `PUT`/`PATCH /api/v1/profile` → `UserProfile::updateProfile`
- `POST /api/v1/profile/image` → `UserProfile::uploadProfileImage`

> Note: All `/api/*` routes require **`X-API-Token`** (enforced by the `apitoken` filter). All `/api/v1/*` routes also require **JWT** (enforced by the `jwtauth` filter).

## Base URL

- Local dev (example): `http://localhost:8080`

So the full URL becomes e.g.:

- `http://localhost:8080/api/v1/profile`

## Authentication & required headers

Include these headers on every request in this guide:

- `X-API-Token: <your_api_token>`
- `Authorization: Bearer <your_jwt_access_token>`

For JSON requests (profile update), also include:

- `Content-Type: application/json`

For file upload (profile image), use:

- `Content-Type: multipart/form-data` (your client will set the boundary)

## Data shape

Profile payload fields returned by the API:

| Field | Type | Notes |
|------|------|------|
| `email` | string \| null | Comes from the `users` table (fallback from profile if present) |
| `full_name` | string \| null | May be `null` if profile not created yet |
| `dob` | string \| null | Format: `YYYY-MM-DD` |
| `gender` | string \| null | Free-form string |
| `profile_image` | string \| null | Stored as **`profile_images/<filename>`** (no leading `uploads/`) |
| `bio` | string \| null | |
| `address` | string \| null | |
| `created_at` | string \| null | DB timestamp |
| `updated_at` | string \| null | DB timestamp |

### Where images are stored

Uploaded files are saved on disk under:

- `writable/uploads/profile_images/<filename>`

But the DB/API value is stored as:

- `profile_images/<filename>`

## 1) Get Profile

### Endpoint

- `GET /api/v1/profile`

### Example request (curl)

```bash
curl -X GET "http://localhost:8080/api/v1/profile" \
  -H "X-API-Token: <API_TOKEN>" \
  -H "Authorization: Bearer <JWT>"
```

### Success response (200)

```json
{
  "email": "user@example.com",
  "full_name": "Jane Doe",
  "dob": "1995-02-27",
  "gender": "female",
  "profile_image": "profile_images/abc_1700000000.jpg",
  "bio": "Hello!",
  "address": "Kuala Lumpur",
  "created_at": "2026-02-27 10:00:00",
  "updated_at": "2026-02-27 10:05:00"
}
```

If the profile row does not exist yet, the endpoint still returns `200` with `null` profile fields (email is still returned if the user exists).

### Common error responses

- `401 Unauthorized`
  - Missing/invalid `Authorization: Bearer ...` (JWT)
  - Missing/invalid `X-API-Token`
- `404 Not Found`
  - User not found in `users` table

## 2) Update Profile (Create or Update)

### Endpoint

- `PUT /api/v1/profile`
- `PATCH /api/v1/profile`

### Request body (JSON)

All fields are optional **when updating an existing profile**.

When creating a profile for the first time, `full_name` is **required**.

```json
{
  "full_name": "Jane Doe",
  "dob": "1995-02-27",
  "gender": "female",
  "bio": "Hello!",
  "address": "Kuala Lumpur"
}
```

### Validation rules

- `full_name`
  - required on **create**
  - if provided, cannot be an empty string
- `dob`
  - if provided, must be `YYYY-MM-DD`

### Example request (curl)

```bash
curl -X PUT "http://localhost:8080/api/v1/profile" \
  -H "X-API-Token: <API_TOKEN>" \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jane Doe",
    "dob": "1995-02-27",
    "gender": "female",
    "bio": "Hello!",
    "address": "Kuala Lumpur"
  }'
```

### Success response (200)

```json
{
  "message": "Profile updated",
  "profile": {
    "email": "user@example.com",
    "full_name": "Jane Doe",
    "dob": "1995-02-27",
    "gender": "female",
    "profile_image": "profile_images/abc_1700000000.jpg",
    "bio": "Hello!",
    "address": "Kuala Lumpur",
    "created_at": "2026-02-27 10:00:00",
    "updated_at": "2026-02-27 10:05:00"
  }
}
```

### Common error responses

- `400 Bad Request` (validation)

Examples:

```json
{
  "messages": {
    "error": {
      "full_name": "Full name is required"
    }
  }
}
```

```json
{
  "messages": {
    "error": {
      "dob": "Invalid date format (YYYY-MM-DD)"
    }
  }
}
```

- `401 Unauthorized`
  - Missing/invalid JWT or API token

## 3) Upload Profile Image

### Endpoint

- `POST /api/v1/profile/image`

### Request body (multipart/form-data)

- Form field name: **`profile_image`**
- Allowed extensions: `jpg`, `jpeg`, `png`, `gif`, `webp`
- Max size: **2MB**

### Example request (curl)

```bash
curl -X POST "http://localhost:8080/api/v1/profile/image" \
  -H "X-API-Token: <API_TOKEN>" \
  -H "Authorization: Bearer <JWT>" \
  -F "profile_image=@/path/to/photo.jpg"
```

### Success response (200)

```json
{
  "message": "Profile image uploaded",
  "profile_image": "profile_images/<generated_filename>.jpg"
}
```

### Notes

- If the user already had a profile image, the API will **best-effort delete** the old file from `writable/uploads/` after the DB update succeeds.
- If the profile row does not exist yet, it will be created automatically. Because `user_profiles.full_name` is `NOT NULL`, a default name will be used (derived from the email prefix, or `"User"`).

### Common error responses

- `400 Bad Request` (validation)

Examples:

```json
{
  "messages": {
    "error": {
      "profile_image": "No file uploaded"
    }
  }
}
```

```json
{
  "messages": {
    "error": {
      "profile_image": "Invalid file type"
    }
  }
}
```

```json
{
  "messages": {
    "error": {
      "profile_image": "File too large (max 2MB)"
    }
  }
}
```

- `401 Unauthorized`
  - Missing/invalid JWT or API token

## CORS / Preflight

For browser clients (Next.js, etc.), the API supports `OPTIONS` preflight routes for:

- `/api/v1/profile`
- `/api/v1/profile/image`

Make sure your frontend includes `X-API-Token` in request headers; the server CORS config already allows this header.
