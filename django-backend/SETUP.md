# Sokoni Kiganjani - Django Backend Setup Guide

Complete guide to set up and run the Django backend for Sokoni Kiganjani marketplace.

## Prerequisites

- Python 3.10 or higher
- pip (Python package manager)
- Git
- PostgreSQL (optional, SQLite works for development)

## Quick Start (5 minutes)

### 1. Clone and Navigate

```bash
cd django-backend
```

### 2. Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the `django-backend` directory:

```bash
# Copy the example below and save as .env
```

```env
# Django Settings
DJANGO_SECRET_KEY=your-super-secret-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (SQLite by default)
USE_SQLITE=True

# PostgreSQL (optional - set USE_SQLITE=False to use)
DB_NAME=sokoni_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# CORS (Frontend URL)
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Timezone
TIME_ZONE=Africa/Nairobi
```

### 5. Run Migrations

```bash
# Apply all migrations to create database tables
python manage.py migrate
```

### 6. Create Superuser (Admin Account)

```bash
python manage.py createsuperuser
```

You will be prompted for:
- **Email**: admin@example.com
- **Username**: admin
- **Password**: (choose a strong password)

### 7. Run the Development Server

```bash
python manage.py runserver
```

The API will be available at: `http://localhost:8000`

Admin panel: `http://localhost:8000/admin`

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login user |
| POST | `/api/auth/logout/` | Logout user |
| GET | `/api/auth/profile/` | Get user profile |
| PUT | `/api/auth/profile/` | Update user profile |
| POST | `/api/auth/change-password/` | Change password |
| POST | `/api/auth/token/refresh/` | Refresh JWT token |

### User Roles

The system supports 5 user roles:
- `customer` - Regular buyers
- `seller` - Shop owners
- `boda` - Delivery riders
- `admin` - Platform administrators
- `super_admin` - Super administrators

---

## User Registration Examples

### Register as Customer

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "securepassword123",
    "password2": "securepassword123",
    "full_name": "John Doe",
    "phone": "+254712345678",
    "role": "customer"
  }'
```

### Register as Seller

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller@example.com",
    "password": "securepassword123",
    "password2": "securepassword123",
    "full_name": "Jane Shop",
    "phone": "+254712345679",
    "role": "seller"
  }'
```

### Register as Boda Rider

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "boda@example.com",
    "password": "securepassword123",
    "password2": "securepassword123",
    "full_name": "Mike Rider",
    "phone": "+254712345680",
    "role": "boda"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "securepassword123"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "customer@example.com",
    "username": "customer",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "role": "customer",
    "phone": "+254712345678"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "message": "Login successful"
}
```

---

## Database Schema

### Users Table
- `id` (UUID) - Primary key
- `email` (unique) - User email
- `username` (unique) - Username
- `password` - Hashed password
- `first_name`, `last_name` - Name fields
- `role` - User role (customer/seller/boda/admin/super_admin)
- `phone` - Phone number
- `address` - Delivery address
- `latitude`, `longitude` - Location coordinates
- `is_active`, `is_staff`, `is_superuser` - Permission flags
- `date_joined`, `last_login` - Timestamps

### Shops Table
- `id` (UUID) - Primary key
- `owner` (FK to User) - Shop owner
- `name`, `description` - Shop details
- `address`, `latitude`, `longitude` - Location
- `is_verified`, `is_active` - Status flags
- `rating`, `total_reviews` - Review stats

### Products Table
- `id` (UUID) - Primary key
- `shop` (FK to Shop) - Parent shop
- `category` (FK to Category) - Product category
- `name`, `description`, `price` - Product details
- `discount_price`, `stock_quantity` - Inventory
- `images` (JSON) - Product images

### Orders Table
- `id` (UUID) - Primary key
- `user` (FK to User) - Customer
- `shop` (FK to Shop) - Shop
- `status` - Order status
- `subtotal`, `delivery_fee`, `total_amount` - Pricing
- `delivery_address` - Delivery location

### Deliveries Table
- `id` (UUID) - Primary key
- `order` (FK to Order) - Related order
- `boda` (FK to BodaProfile) - Assigned rider
- `status` - Delivery status
- `pickup_address`, `delivery_address` - Addresses
- `delivery_fee`, `boda_earnings` - Payments

---

## Role-Based Dashboard Access

After login, redirect users based on their role:

| Role | Dashboard URL | Features |
|------|---------------|----------|
| `customer` | `/customer/dashboard` | Browse, Order, Track |
| `seller` | `/seller/dashboard` | Manage Shop, Products, Orders |
| `boda` | `/boda/dashboard` | Accept Deliveries, Track Earnings |
| `admin` | `/admin/dashboard` | Manage Users, View Reports |
| `super_admin` | `/admin` | Full Django Admin Access |

---

## Frontend Integration

### Using with Next.js

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}

export async function register(data: RegisterData) {
  const response = await fetch(`${API_URL}/api/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function getProfile(accessToken: string) {
  const response = await fetch(`${API_URL}/api/auth/profile/`, {
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  return response.json();
}
```

### Storing Tokens

```typescript
// After login, store tokens
localStorage.setItem('access_token', response.access);
localStorage.setItem('refresh_token', response.refresh);
localStorage.setItem('user', JSON.stringify(response.user));

// For authenticated requests
const token = localStorage.getItem('access_token');
fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

---

## Common Commands

```bash
# Run development server
python manage.py runserver

# Run on specific port
python manage.py runserver 0.0.0.0:8080

# Create new migrations after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Open Django shell
python manage.py shell

# Collect static files (production)
python manage.py collectstatic

# Run tests
python manage.py test
```

---

## Production Deployment

### 1. Update Settings

```env
DEBUG=False
DJANGO_SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
USE_SQLITE=False
```

### 2. Use PostgreSQL

```env
USE_SQLITE=False
DB_NAME=sokoni_production
DB_USER=postgres
DB_PASSWORD=strong_password_here
DB_HOST=your-db-host.com
DB_PORT=5432
```

### 3. Run with Gunicorn

```bash
gunicorn sokoni.wsgi:application --bind 0.0.0.0:8000
```

---

## Troubleshooting

### "No module named 'rest_framework'"
```bash
pip install djangorestframework
```

### "CORS error"
Add your frontend URL to `CORS_ALLOWED_ORIGINS` in settings.py or .env

### "Migration errors"
```bash
# Reset migrations (development only!)
python manage.py migrate --fake accounts zero
python manage.py migrate accounts
```

### "Invalid credentials" on login
- Verify email/password are correct
- Check user is active (`is_active=True`)
- Ensure migrations are applied

---

## Support

For issues or questions, create an issue in the repository or contact the development team.
