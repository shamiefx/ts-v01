# AUTH API Guide

This guide explains how to use the authentication endpoints (`signup` and `login`) for your CodeIgniter 4 REST API.

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
  "user_id": "<uuid>"
}
```

- The user is automatically assigned the `subscriber` role.
- Password is securely hashed.

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
  "password": "yourpassword"
}
```

**Response (200 OK):**
```
{
  "token": "<jwt_token>",
  "user_id": "<uuid>",
  "email": "user@example.com"
}
```

- Returns a JWT token for authenticated requests.
- Token is valid for 1 hour by default.

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

// Login
const res = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const data = await res.json();
const jwt = data.token;
```

---

## 5. Security Notes
- Always use HTTPS in production.
- Never log or expose raw passwords.
- Store JWT tokens securely (e.g., httpOnly cookies or secure storage).

---

For more details, see `API_GUIDE.md` and `CONFIG_API.md` in the project root.
