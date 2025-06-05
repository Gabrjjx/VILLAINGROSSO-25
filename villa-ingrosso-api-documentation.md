# Villa Ingrosso REST API Documentation

## Service Information
- **Name**: Villa Ingrosso API
- **Service Name**: villa-ingrosso-api
- **Development URL**: https://35683667-e27b-4a35-9b6b-cd2b453f9995-00-1q7kecmao3gy.worf.replit.dev/api
- **Production URL**: https://villaingrosso.com/api
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy and session management
- **Email Service**: Bird API (primary) with SendGrid fallback
- **SMS Service**: Twilio API
- **File Storage**: Static file serving from public directory
- **Configuration Mode**: Manual

## Technology Stack
- **Backend**: Node.js with Express.js
- **Frontend**: React with TypeScript and Vite
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Authentication**: Passport.js with session store
- **Email**: Bird API + SendGrid
- **SMS**: Twilio
- **UI Framework**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query
- **Routing**: Wouter

## Required Headers

### For All API Requests
```
Content-Type: application/json
Accept: application/json
```

### Authentication Methods

**Session-Based Authentication (Primary)**
- Authentication is handled via session cookies
- After login, the session cookie is automatically included in requests
- No additional headers needed for authenticated endpoints

**Manual Testing with Postman**

For testing endpoints that require authentication, you must first login and obtain a session cookie:

1. **Login first** using `/api/login` endpoint
2. **Copy the session cookie** from the response
3. **Add cookie header** to subsequent requests

**Postman Headers for Authenticated Requests:**
```
Content-Type: application/json
Accept: application/json
Cookie: connect.sid=<session_cookie_value>
```

### Headers by Endpoint Type

**Public Endpoints (No Authentication Required):**
- `/api/contact`
- `/api/promotions/active` 
- `/api/blog`
- `/api/blog/:slug`
- `/api/faqs`
- `/api/faqs/search`
- `/api/faqs/:id/view`
- `/api/calculate-distances`

**Headers:**
```
Content-Type: application/json
Accept: application/json
```

**Authentication Endpoints:**
- `/api/register`
- `/api/login` 
- `/api/logout`

**Headers:**
```
Content-Type: application/json
Accept: application/json
```

**User Authenticated Endpoints:**
- `/api/user`
- `/api/bookings`
- `/api/user/change-password`
- `/api/user/profile`
- `/api/chat-messages`
- `/api/inventory/*`
- `/api/faqs/:id/vote`

**Headers:**
```
Content-Type: application/json
Accept: application/json
Cookie: connect.sid=<session_cookie_from_login>
```

**Admin Only Endpoints:**
- `/api/admin/*`
- `/api/newsletter/send`
- `/api/blog` (POST/PUT/DELETE)
- `/api/faqs` (POST/PUT/DELETE)

**Headers:**
```
Content-Type: application/json
Accept: application/json
Cookie: connect.sid=<admin_session_cookie_from_login>
```

**Communication Endpoints (User Required):**
- `/api/send-booking-confirmation`
- `/api/send-welcome-email`
- `/api/send-sms`
- `/api/send-booking-whatsapp`
- `/api/send-welcome-whatsapp`
- `/api/test-email`
- `/api/test-bird-email`

**Headers:**
```
Content-Type: application/json
Accept: application/json
Cookie: connect.sid=<session_cookie_from_login>
```

## Postman Testing Guide

### Step 1: Test Public Endpoints (No Authentication)

**Example: Get Active Promotion**
```
Method: GET
URL: {{base_url}}/api/promotions/active
Headers:
  Content-Type: application/json
  Accept: application/json
```

**Example: Contact Form**
```
Method: POST
URL: {{base_url}}/api/contact
Headers:
  Content-Type: application/json
  Accept: application/json
Body (raw JSON):
{
  "name": "Test User",
  "email": "test@example.com",
  "phone": "+393471234567",
  "message": "Test message from Postman"
}
```

### Step 2: Login and Get Session Cookie

**Login Request:**
```
Method: POST
URL: {{base_url}}/api/login
Headers:
  Content-Type: application/json
  Accept: application/json
Body (raw JSON):
{
  "username": "your_username",
  "password": "your_password"
}
```

**Copy Session Cookie from Response:**
1. After successful login, go to Response Headers
2. Find `Set-Cookie` header
3. Copy the `connect.sid` value (example: `connect.sid=s%3AHGbE0K4q...`)
4. Use this in subsequent authenticated requests

### Step 3: Test Authenticated Endpoints

**Example: Get User Profile**
```
Method: GET
URL: {{base_url}}/api/user
Headers:
  Content-Type: application/json
  Accept: application/json
  Cookie: connect.sid=s%3AHGbE0K4qMSjsVPcQX2-UbR0ojeLSu86A.TiApmMdOyXgAFokp0DaNCEGeucqoYGGb7Jk8IodTEVs
```

**Example: Create Booking**
```
Method: POST
URL: {{base_url}}/api/bookings
Headers:
  Content-Type: application/json
  Accept: application/json
  Cookie: connect.sid=s%3AHGbE0K4qMSjsVPcQX2-UbR0ojeLSu86A.TiApmMdOyXgAFokp0DaNCEGeucqoYGGb7Jk8IodTEVs
Body (raw JSON):
{
  "guestName": "Mario Rossi",
  "guestEmail": "mario@example.com",
  "guestPhone": "+393471234567",
  "startDate": "2024-07-01",
  "endDate": "2024-07-07",
  "numberOfGuests": 2,
  "totalPrice": 500.00,
  "notes": "Test booking from Postman"
}
```

### Step 4: Test Admin Endpoints (Requires Admin User)

First login with admin credentials, then:

**Example: Get All Users (Admin)**
```
Method: GET
URL: {{base_url}}/api/admin/users
Headers:
  Content-Type: application/json
  Accept: application/json
  Cookie: connect.sid=<admin_session_cookie>
```

**Example: Create Blog Post (Admin)**
```
Method: POST
URL: {{base_url}}/api/blog
Headers:
  Content-Type: application/json
  Accept: application/json
  Cookie: connect.sid=<admin_session_cookie>
Body (raw JSON):
{
  "title": "Test Blog Post",
  "content": "This is a test blog post created via Postman API",
  "excerpt": "Test excerpt",
  "status": "published"
}
```

### Environment Variables for Postman

Create these variables in Postman Environment:

```
base_url: http://localhost:5000 (for development)
base_url: https://villaingrosso.com (for production)

session_cookie: <paste your session cookie here after login>
admin_session_cookie: <paste admin session cookie here>
```

Then use `{{base_url}}` and `{{session_cookie}}` in your requests.

### Common Response Codes

- **200**: Success
- **201**: Created successfully
- **400**: Bad request (validation error)
- **401**: Unauthorized (login required)
- **403**: Forbidden (admin access required)
- **404**: Not found
- **500**: Server error

### Testing Communication APIs

**Example: Send SMS (Requires Authentication)**
```
Method: POST
URL: {{base_url}}/api/send-sms
Headers:
  Content-Type: application/json
  Accept: application/json
  Cookie: connect.sid=<session_cookie>
Body (raw JSON):
{
  "to": "+393471234567",
  "message": "Test SMS from Villa Ingrosso API"
}
```

**Example: Send Test Email**
```
Method: POST
URL: {{base_url}}/api/test-email
Headers:
  Content-Type: application/json
  Accept: application/json
  Cookie: connect.sid=<session_cookie>
Body (raw JSON):
{
  "email": "test@example.com",
  "subject": "Test Email",
  "content": "This is a test email from Postman"
}
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

## Promotions API

### Get Active Promotion
**GET** `/api/promotions/active`
- Public endpoint
- Returns currently active promotion information

**Response:**
```json
{
  "available": true,
  "promotion": {
    "id": 1,
    "code": "PRIMI20",
    "description": "Sconto del 10% per i primi 20 ospiti",
    "discountPercentage": 10,
    "remainingUsages": 15
  }
}
```

Or if no promotion is active:
```json
{
  "available": false
}
```

## Communication APIs

### Send Contact Message
**POST** `/api/contact`
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "message": "string"
}
```
- Sends email notification to property owner
- Returns success confirmation

### Send Booking Confirmation Email
**POST** `/api/send-booking-confirmation`
- Requires authentication
```json
{
  "email": "string",
  "guestName": "string",
  "checkIn": "2024-01-01",
  "checkOut": "2024-01-07",
  "numberOfGuests": 2
}
```

### Send Welcome Email
**POST** `/api/send-welcome-email`
- Requires authentication
```json
{
  "email": "string",
  "username": "string",
  "password": "string"
}
```

### Newsletter Subscription
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

### Send SMS
**POST** `/api/send-sms`
- Requires authentication
```json
{
  "to": "+393471234567",
  "message": "string"
}
```

### Send WhatsApp Booking Notification
**POST** `/api/send-booking-whatsapp`
- Requires authentication
```json
{
  "guestName": "string",
  "guestEmail": "string",
  "checkIn": "2024-01-01",
  "checkOut": "2024-01-07",
  "numberOfGuests": 2
}
```

### Send Welcome WhatsApp
**POST** `/api/send-welcome-whatsapp`
- Requires authentication
```json
{
  "phone": "+393471234567",
  "username": "string",
  "password": "string"
}
```

## Password Management

### Request Password Reset
**POST** `/api/request-password-reset`
```json
{
  "email": "string"
}
```
- Sends password reset email with token

### Reset Password
**POST** `/api/reset-password`
```json
{
  "token": "string",
  "newPassword": "string"
}
```

### Change Password (User)
**PATCH** `/api/user/change-password`
- Requires authentication
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

### Generate Reset Token (Admin)
**POST** `/api/admin/generate-reset-token`
- Requires admin authentication
```json
{
  "email": "string"
}
```

### Update User Profile
**PATCH** `/api/user/profile`
- Requires authentication
```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "dateOfBirth": "1990-01-01"
}
```

## Blog Management

### Get All Blog Posts
**GET** `/api/blog`
- Public endpoint

**Response:**
```json
[
  {
    "id": 1,
    "title": "string",
    "slug": "string",
    "excerpt": "string",
    "content": "string",
    "status": "published",
    "viewCount": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "author": {
      "id": 1,
      "fullName": "string"
    }
  }
]
```

### Get Blog Post by Slug
**GET** `/api/blog/:slug`
- Public endpoint
- Increments view count

### Create Blog Post (Admin)
**POST** `/api/blog`
- Requires admin authentication
```json
{
  "title": "string",
  "content": "string",
  "excerpt": "string",
  "status": "published" | "draft"
}
```
- Automatically generates slug from title

### Update Blog Post (Admin)
**PUT** `/api/blog/:id`
- Requires admin authentication
```json
{
  "title": "string",
  "content": "string",
  "excerpt": "string",
  "status": "published" | "draft"
}
```

### Delete Blog Post (Admin)
**DELETE** `/api/blog/:id`
- Requires admin authentication

## FAQ Management

### Get All FAQs
**GET** `/api/faqs`
- Public endpoint
- Optional query parameter: `?category=string`

**Response:**
```json
[
  {
    "id": 1,
    "question": "string",
    "answer": "string",
    "category": "string",
    "priority": 1,
    "isPublished": true,
    "viewCount": 0,
    "helpfulVotes": 0,
    "notHelpfulVotes": 0,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Search FAQs
**GET** `/api/faqs/search?q=search_term`
- Public endpoint

### View FAQ (Track View Count)
**POST** `/api/faqs/:id/view`
- Public endpoint
- Increments view count

### Vote on FAQ Helpfulness
**POST** `/api/faqs/:id/vote`
- Requires authentication
```json
{
  "helpful": true
}
```

### Create FAQ (Admin)
**POST** `/api/faqs`
- Requires admin authentication
```json
{
  "question": "string",
  "answer": "string",
  "category": "string",
  "priority": 1,
  "isPublished": true
}
```

### Update FAQ (Admin)
**PUT** `/api/faqs/:id`
- Requires admin authentication
```json
{
  "question": "string",
  "answer": "string",
  "category": "string",
  "priority": 1,
  "isPublished": true
}
```

### Delete FAQ (Admin)
**DELETE** `/api/faqs/:id`
- Requires admin authentication

## Inventory Management

### Get All Inventory Items
**GET** `/api/inventory`
- Requires authentication

**Response:**
```json
[
  {
    "id": 1,
    "name": "string",
    "description": "string",
    "category": "string",
    "quantity": 10,
    "minQuantity": 2,
    "unit": "pieces",
    "location": "storage room",
    "notes": "string",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastChecked": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Low Stock Items
**GET** `/api/inventory/low-stock`
- Requires authentication
- Returns items where quantity <= minQuantity

### Create Inventory Item
**POST** `/api/inventory`
- Requires authentication
```json
{
  "name": "string",
  "description": "string",
  "category": "string",
  "quantity": 10,
  "minQuantity": 2,
  "unit": "pieces",
  "location": "string",
  "notes": "string"
}
```

### Update Inventory Item
**PUT** `/api/inventory/:id`
- Requires authentication
```json
{
  "name": "string",
  "description": "string",
  "category": "string",
  "quantity": 10,
  "minQuantity": 2,
  "unit": "pieces",
  "location": "string",
  "notes": "string"
}
```

### Delete Inventory Item
**DELETE** `/api/inventory/:id`
- Requires authentication

### Record Inventory Movement
**POST** `/api/inventory/movements`
- Requires authentication
```json
{
  "itemId": 1,
  "type": "in" | "out" | "adjustment",
  "quantity": 5,
  "reason": "string",
  "notes": "string"
}
```

### Get Inventory Movements
**GET** `/api/inventory/movements`
- Requires authentication
- Optional query parameter: `?itemId=1`

## Chat System

### Get User Chat Messages
**GET** `/api/chat-messages`
- Requires authentication
- Returns messages for authenticated user

### Get Admin Chat Messages for User
**GET** `/api/admin/chat-messages/:userId`
- Requires admin authentication

### Send Chat Message
**POST** `/api/chat-messages`
- Requires authentication
```json
{
  "message": "string"
}
```

### Send Admin Chat Message
**POST** `/api/admin/chat-messages/:userId`
- Requires admin authentication
```json
{
  "message": "string"
}
```

## Admin Contact Management

### Get All Contact Messages (Admin)
**GET** `/api/admin/messages`
- Requires admin authentication

### Mark Contact Message as Read (Admin)
**PATCH** `/api/admin/messages/:id/read`
- Requires admin authentication

## Utility APIs

### Calculate Distances
**POST** `/api/calculate-distances`
```json
{
  "origin": "Villa Ingrosso address",
  "destinations": ["destination1", "destination2"]
}
```
- Uses Google Maps API to calculate distances
- Returns travel times and distances

### Test Email (Debug)
**POST** `/api/test-email`
- Requires authentication
```json
{
  "email": "string",
  "subject": "string",
  "content": "string"
}
```

### Test Bird Email (Debug)
**POST** `/api/test-bird-email`
- Requires authentication
```json
{
  "email": "string"
}
```

## Database Schema

### Users Table
- id, username, email, password, fullName, phone, dateOfBirth, isAdmin, resetToken, resetTokenExpiry, createdAt, notes

### Bookings Table
- id, userId, guestName, guestEmail, guestPhone, startDate, endDate, numberOfGuests, totalPrice, status, source, notes, createdAt

### Contact Messages Table
- id, name, email, phone, message, read, createdAt

### Blog Posts Table
- id, title, slug, content, excerpt, status, authorId, viewCount, createdAt, updatedAt

### FAQs Table
- id, question, answer, category, priority, isPublished, viewCount, helpfulVotes, notHelpfulVotes, createdAt, updatedAt

### Inventory Items Table
- id, name, description, category, quantity, minQuantity, unit, location, notes, createdAt, lastChecked

### Inventory Movements Table
- id, itemId, type, quantity, reason, notes, createdAt

### Chat Messages Table
- id, userId, message, isFromAdmin, createdAt

### Promotions Table
- id, code, discountPercentage, maxUsages, currentUsages, isActive, description, createdAt, expiresAt

### Promotion Usages Table
- id, promotionId, bookingId, userId, discountAmount, usedAt

## Environment Variables Required

### Database
- DATABASE_URL
- PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE

### Authentication
- SESSION_SECRET

### Email Services
- BIRD_API_KEY
- BIRD_EMAIL_CHANNEL_ID
- BIRD_WORKSPACE_ID
- SENDGRID_API_KEY

### SMS Service
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER

### Maps API
- VITE_GOOGLE_MAPS_API_KEY

## Features Implemented

### Core Booking System
- User registration and authentication
- Booking creation with automatic promotion application
- Admin booking management
- Email and SMS notifications

### Promotion System
- Automatic 10% discount for first 20 customers
- Promotion tracking and usage limits
- API to check active promotions

### Communication System
- Contact form with email notifications
- Newsletter subscription and management
- Welcome emails for new users
- Booking confirmation emails
- SMS and WhatsApp notifications via Twilio

### Content Management
- Blog system with CRUD operations
- FAQ system with voting and search
- Content creation and management for admins

### Inventory Management
- Track villa supplies and amenities
- Low stock alerts
- Movement tracking (in/out/adjustments)

### Customer Support
- Real-time chat system between users and admins
- Contact message management
- Password reset functionality

### Admin Dashboard
- User management
- Booking management
- Content management
- Inventory tracking
- Communication tools

### Advanced Features
- Google Maps integration for distance calculations
- Responsive design for mobile and desktop
- SEO optimization with Open Graph meta tags
- Social media integration
- Multiple authentication methods
- Comprehensive error handling and logging

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