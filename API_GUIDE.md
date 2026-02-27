# API Integration Guide: Next.js & Flutter

This guide explains how to connect your Next.js frontend and Flutter mobile app to the CodeIgniter 4 REST API secured with CORS, API Token, and JWT authentication.

---

## Important: API Token Required

All `/api/*` endpoints require the `X-API-Token` header in every request.

Example:
```
POST /api/v1/companies
Headers:
  X-API-Token: <your_api_token>
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
```

If the token is missing or invalid, you will get **401 Unauthorized**.

---

---

## 1. Authentication Flow

1. **Login (Get JWT Token):**
   - Send a `POST` request to `/api/login` with the `X-API-Token` header.
   - Receive a JWT token in the response.
2. **Access Protected Endpoints:**
   - Send requests to endpoints like `/api/example` with the `Authorization: Bearer <JWT token>` header.

---

## 2. Example: Next.js (JavaScript/TypeScript)

### Login (Get JWT)
```js
const apiToken = 'YOUR_API_TOKEN';
const login = async () => {
  const res = await fetch('http://localhost:8080/api/login', {
    method: 'POST',
    headers: { 'X-API-Token': apiToken },
  });
  const data = await res.json();
  return data.token;
};
```

### Access Protected Endpoint
```js
const getExample = async (jwt) => {
  const res = await fetch('http://localhost:8080/api/example', {
    headers: { 'Authorization': `Bearer ${jwt}` },
  });
  return await res.json();
};
```

---

## 3. Example: Flutter (Dart)

### Login (Get JWT)
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

final apiToken = 'YOUR_API_TOKEN';
Future<String?> login() async {
  final response = await http.post(
    Uri.parse('http://localhost:8080/api/login'),
    headers: {'X-API-Token': apiToken},
  );
  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    return data['token'];
  }
  return null;
}
```

### Access Protected Endpoint
```dart
Future<Map<String, dynamic>?> getExample(String jwt) async {
  final response = await http.get(
    Uri.parse('http://localhost:8080/api/example'),
    headers: {'Authorization': 'Bearer $jwt'},
  );
  if (response.statusCode == 200) {
    return json.decode(response.body);
  }
  return null;
}
```

---

## 4. CORS & Mobile Notes
- **Next.js**: CORS is enabled for all origins by default. For production, restrict allowed origins in `app/Config/Cors.php`.
- **Flutter**: No CORS issues for mobile apps.
- Always use HTTPS in production.

---

## 5. Error Handling
- 401 Unauthorized: Check your API token or JWT.
- 403 Forbidden: You may not have access to the endpoint.
- 500 Server Error: Check API server logs.

---

## 6. Security
- Never expose your API token or JWT in public repos.
- Store secrets in environment variables or secure storage.

---

For more details, see `CONFIG_API.md` and `README.md` in the project root.
