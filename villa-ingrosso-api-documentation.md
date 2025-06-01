# Villa Ingrosso REST API Documentation

## Service Information
- **Name**: Villa Ingrosso API
- **Service Name**: villa-ingrosso-api
- **Development URL**: https://35683667-e27b-4a35-9b6b-cd2b453f9995-00-1q7kecmao3gy.worf.replit.dev/api
- **Production URL**: https://villaingrosso.com/api
- **Query Array Format**: JSON - Example: `p=["a","b","c"]`
- **Configuration Mode**: Manual

## Required Headers
All API requests should include these headers:
```
Content-Type: application/json
Accept: application/json
```

For authenticated endpoints, also include:
```
Authorization: Bearer <jwt_token>
```

## Authentication

### JWT Token Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Login
**POST** `/api/login`
```json
{
  "username": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "fullName": "string",
  "isAdmin": boolean,
  "token": "jwt_token_string"
}
```

### Register
**POST** `/api/register`
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "fullName": "string",
  "phone": "string",
  "dateOfBirth": "2024-01-01",
  "privacyAccepted": true
}
```

### Logout
**POST** `/api/logout`
- No body required
- Clears session

### Get Current User
**GET** `/api/user`
- Requires authentication
**Response:**
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "fullName": "string",
  "phone": "string",
  "dateOfBirth": "2024-01-01",
  "isAdmin": boolean,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## User Management

### Update User Profile
**PATCH** `/api/user/profile`
- Requires authentication
```json
{
  "fullName": "string",
  "phone": "string",
  "dateOfBirth": "2024-01-01"
}
```

### Change Password
**PATCH** `/api/user/change-password`
- Requires authentication
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

### Request Password Reset
**POST** `/api/request-password-reset`
```json
{
  "email": "user@example.com"
}
```

### Reset Password
**POST** `/api/reset-password`
```json
{
  "token": "reset_token",
  "newPassword": "string"
}
```

### Reset Password Direct (Admin)
**POST** `/api/reset-password-direct`
- Requires admin authentication
```json
{
  "email": "user@example.com",
  "newPassword": "string"
}
```

## Booking Management

### Get User Bookings
**GET** `/api/bookings`
- Requires authentication
- Returns bookings for the authenticated user

**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "guestName": "string",
    "guestEmail": "string",
    "guestPhone": "string",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-07T00:00:00.000Z",
    "numberOfGuests": 2,
    "totalPrice": 500.00,
    "status": "confirmed",
    "source": "website",
    "notes": "string",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Create Booking
**POST** `/api/bookings`
- Requires authentication
```json
{
  "guestName": "string",
  "guestEmail": "string",
  "guestPhone": "string",
  "startDate": "2024-01-01",
  "endDate": "2024-01-07",
  "numberOfGuests": 2,
  "totalPrice": 500.00,
  "notes": "string"
}
```

## Admin Endpoints

### Get All Users (Admin)
**GET** `/api/admin/users`
- Requires admin authentication

### Get All Bookings (Admin)
**GET** `/api/admin/bookings`
- Requires admin authentication

### Create Manual Booking (Admin)
**POST** `/api/admin/manual-booking`
- Requires admin authentication
```json
{
  "guestName": "string",
  "guestEmail": "string",
  "guestPhone": "string",
  "startDate": "2024-01-01",
  "endDate": "2024-01-07",
  "numberOfGuests": 2,
  "totalPrice": 500.00,
  "status": "confirmed",
  "source": "phone",
  "notes": "string",
  "userId": 1
}
```

### Create Manual User (Admin)
**POST** `/api/admin/manual-user`
- Requires admin authentication
- Sends welcome email with password
```json
{
  "username": "string",
  "email": "string",
  "fullName": "string",
  "phone": "string",
  "dateOfBirth": "2024-01-01",
  "password": "string",
  "notes": "string"
}
```

### Delete Booking (Admin)
**DELETE** `/api/admin/bookings/:id`
- Requires admin authentication

### Update Booking Status (Admin)
**PATCH** `/api/admin/bookings/:id/status`
- Requires admin authentication
```json
{
  "status": "confirmed" | "cancelled" | "pending" | "completed"
}
```

## Contact Messages

### Submit Contact Message
**POST** `/api/contact`
```json
{
  "name": "string",
  "email": "string",
  "message": "string"
}
```

### Get All Contact Messages (Admin)
**GET** `/api/admin/messages`
- Requires admin authentication

### Mark Message as Read (Admin)
**PATCH** `/api/admin/messages/:id/read`
- Requires admin authentication

## Chat System

### Get User Chat Messages
**GET** `/api/chat-messages`
- Requires authentication
- Returns chat messages for the authenticated user

### Send Chat Message
**POST** `/api/chat-messages`
- Requires authentication
```json
{
  "message": "string"
}
```

### Get Admin Chat Messages for User
**GET** `/api/admin/chat-messages/:userId`
- Requires admin authentication

### Send Admin Chat Message
**POST** `/api/admin/chat-messages/:userId`
- Requires admin authentication
```json
{
  "message": "string"
}
```

## Email Services

### Send Welcome Email
**POST** `/api/send-welcome-email`
- Requires admin authentication
```json
{
  "guestEmail": "string",
  "guestName": "string"
}
```

### Send Booking Confirmation Email
**POST** `/api/send-booking-confirmation`
```json
{
  "guestEmail": "string",
  "guestName": "string",
  "checkIn": "2024-01-01",
  "checkOut": "2024-01-07"
}
```

### Test Email
**POST** `/api/test-email`
- Requires admin authentication
```json
{
  "to": "email@example.com",
  "subject": "string",
  "message": "string"
}
```

### Test Bird Email
**POST** `/api/test-bird-email`
- Requires admin authentication
```json
{
  "to": "email@example.com",
  "subject": "string",
  "htmlContent": "string"
}
```

### Send Custom Email (Admin)
**POST** `/api/admin/send-custom-email`
- Requires admin authentication
```json
{
  "recipients": ["email1@example.com", "email2@example.com"],
  "subject": "string",
  "content": "string",
  "template": "welcome" | "booking" | "newsletter" | "custom"
}
```

### Newsletter Subscribe
**POST** `/api/newsletter/subscribe`
```json
{
  "email": "string",
  "firstName": "string"
}
```

### Send Newsletter (Admin)
**POST** `/api/newsletter/send`
- Requires admin authentication
```json
{
  "subject": "string",
  "content": "string"
}
```

## SMS/WhatsApp Services

### Send SMS
**POST** `/api/send-sms`
- Requires admin authentication
```json
{
  "phoneNumber": "+1234567890",
  "message": "string"
}
```

### Send Booking WhatsApp
**POST** `/api/send-booking-whatsapp`
- Requires admin authentication
```json
{
  "phoneNumber": "+1234567890",
  "guestName": "string",
  "checkIn": "2024-01-01",
  "checkOut": "2024-01-07"
}
```

### Send Welcome WhatsApp
**POST** `/api/send-welcome-whatsapp`
- Requires admin authentication
```json
{
  "phoneNumber": "+1234567890",
  "guestName": "string"
}
```

## Utility Services

### Generate Admin Reset Token
**POST** `/api/admin/generate-reset-token`
- Requires admin authentication
```json
{
  "email": "user@example.com"
}
```

### Calculate Distances
**POST** `/api/calculate-distances`
```json
{
  "userLocation": {
    "lat": 40.1234,
    "lng": 17.5678
  }
}
```

## Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

## Error Response Format
```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

## Rate Limiting
- Standard endpoints: 100 requests per minute
- Authentication endpoints: 10 requests per minute
- Email/SMS endpoints: 5 requests per minute

## Data Models

### User Model
```json
{
  "id": "integer",
  "username": "string",
  "email": "string",
  "fullName": "string",
  "phone": "string",
  "dateOfBirth": "date",
  "isAdmin": "boolean",
  "privacyAccepted": "boolean",
  "createdAt": "datetime"
}
```

### Booking Model
```json
{
  "id": "integer",
  "userId": "integer",
  "guestName": "string",
  "guestEmail": "string",
  "guestPhone": "string",
  "startDate": "datetime",
  "endDate": "datetime",
  "numberOfGuests": "integer",
  "totalPrice": "float",
  "status": "string",
  "source": "string",
  "notes": "text",
  "createdAt": "datetime"
}
```

### Contact Message Model
```json
{
  "id": "integer",
  "name": "string",
  "email": "string",
  "message": "text",
  "read": "boolean",
  "createdAt": "datetime"
}
```

### Chat Message Model
```json
{
  "id": "integer",
  "userId": "integer",
  "isFromAdmin": "boolean",
  "message": "text",
  "createdAt": "datetime"
}
```

## Newsletter Management

### Subscribe to Newsletter
**POST** `/api/newsletter/subscribe`

Subscribe a user to the Villa Ingrosso newsletter.

**Headers:**
```
Content-Type: application/json
Accept: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "Mario" // optional
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Successfully subscribed to newsletter"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Error message description",
  "error": "Detailed error information"
}
```

**Behavior:**
- Validates email format
- Sends welcome email via Bird API
- Uses configured BIRD_EMAIL_CHANNEL_ID
- Returns immediate response

**Example cURL:**
```bash
curl -X POST https://villaingrosso.com/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email": "mario@example.com", "firstName": "Mario"}'
```

### Send Newsletter (Admin Only)
**POST** `/api/newsletter/send`

Send newsletter to multiple recipients. Requires admin authentication.

**Headers:**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "subject": "Newsletter Subject",
  "content": "<html>Newsletter content</html>",
  "recipients": ["email1@example.com", "email2@example.com"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Newsletter sent successfully",
  "sent": 2,
  "failed": 0
}
```

---

*Last updated: June 1, 2025*
*API Version: 1.1*