# AUTH API Guide

This guide explains how to use the authentication endpoints (`signup` and `login`) for your CodeIgniter 4 REST API.

---

## Important: API Token Required

All `/api/auth/*` endpoints require the `X-API-Token` header in every request.

Example:
```
POST /api/auth/login
Headers:
  X-API-Token: <your_api_token>
  Content-Type: application/json
```

If the token is missing or invalid, you will get **401 Unauthorized**.

---

---


## 1. Signup (Register)

**Endpoint:**
```
POST /api/auth/signup
```

**Request Body (JSON):**
```
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response (201 Created):**
```
{
  "message": "User registered successfully",
  "user_id": "<uuid>",
  "email": "user@example.com",
  "access_token": "<jwt_access_token>",
  "token_type": "Bearer",
  "expires_in": 900
}
```

- The user is automatically assigned the `subscriber` role.
- Password is securely hashed.
- You receive an access token immediately after signup.

---


## 2. Login (Sign In)

**Endpoint:**
```
POST /api/auth/login
```

**Request Body (JSON):**
```
{
  "email": "user@example.com",
  "password": "yourpassword",
  "is_web": true|false,         // optional, true for web, false/omit for mobile
  "device_name": "iPhone 15"   // optional (mobile)
}
```

**Response (200 OK):**

- **Web:**
  - Returns only the access token in the response, refresh token is set as an httpOnly cookie.
  - Example:
    ```
    {
      "access_token": "<jwt_access_token>",
      "token_type": "Bearer",
      "expires_in": 900,
      "user": {
        "user_id": "<uuid>",
        "email": "user@example.com"
      }
    }
    ```

- **Mobile:**
  - Returns both access and refresh tokens in the response body.
  - Example:
    ```
    {
      "access_token": "<jwt_access_token>",
      "refresh_token": "<refresh_token>",
      "token_type": "Bearer",
      "expires_in": 900,
      "user": {
        "user_id": "<uuid>",
        "email": "user@example.com"
      }
    }
    ```

- Access token is valid for 15 minutes by default (configurable).
- Refresh token is valid for 30 days by default (configurable).

---


## 3. Error Responses

- **Validation error:**
  ```
  {
    "messages": {
      "email": "The email field must contain a valid email address.",
      ...
    }
  }
  ```
- **Email already registered:**
  ```
  {
    "messages": "Email already registered"
  }
  ```
- **Invalid credentials:**
  ```
  {
    "messages": "Invalid email or password"
  }
  ```

---

## 4. Usage Example (JavaScript/Next.js)

```js

// Signup
await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// Login (Web)
const res = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, is_web: true })
});
const data = await res.json();
const jwt = data.access_token;

// Login (Mobile)
const resMobile = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const dataMobile = await resMobile.json();
const jwtMobile = dataMobile.access_token;
const refreshToken = dataMobile.refresh_token;
```

---


## 5. Security Notes
- Always use HTTPS in production.
- Never log or expose raw passwords.
- Store JWT tokens securely (e.g., httpOnly cookies for web, secure storage for mobile).
- Refresh tokens should only be sent over secure channels and never exposed to JavaScript on web (httpOnly cookie).

---

For more details, see `API_GUIDE.md` and `CONFIG_API.md` in the project root.
