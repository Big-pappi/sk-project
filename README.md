# Sokoni Kiganjani

A modern e-commerce marketplace platform connecting local sellers with customers, featuring real-time delivery tracking with Boda riders.

## Tech Stack

### Frontend (This Repository)
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: React Context + SWR
- **Language**: TypeScript

### Backend (Separate Repository)
- **Framework**: Django 5.x + Django REST Framework
- **Authentication**: JWT (SimpleJWT)
- **Database**: PostgreSQL (or SQLite for development)

---

## Getting Started

### Prerequisites

- Node.js 18+ (for frontend)
- Python 3.10+ (for backend)
- PostgreSQL (optional, SQLite works for development)

---

## Frontend Setup (Next.js)

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/Big-pappi/sokoni-kiganjani.git
cd sokoni-kiganjani

# Install dependencies
npm install
# or
pnpm install
# or
yarn install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# API URL - Point to your Django backend
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 3. Run Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

The frontend will be available at `http://localhost:3000`

---

## Backend Setup (Django)

### 1. Create Project Directory

```bash
# Create a separate directory for the backend
mkdir sokoni-backend
cd sokoni-backend
```

### 2. Set Up Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 3. Install Django Dependencies

```bash
# Install required packages
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers pillow python-dotenv psycopg2-binary

# Or create a requirements.txt and install:
pip install -r requirements.txt
```

**requirements.txt:**
```txt
Django>=5.0
djangorestframework>=3.14
djangorestframework-simplejwt>=5.3
django-cors-headers>=4.3
Pillow>=10.0
python-dotenv>=1.0
psycopg2-binary>=2.9
```

### 4. Create Django Project Structure

```bash
# Create Django project
django-admin startproject sokoni .

# Create apps
python manage.py startapp accounts
python manage.py startapp products
python manage.py startapp orders
python manage.py startapp shops
python manage.py startapp deliveries
```

### 5. Configure Environment Variables

Create a `.env` file in the backend root:

```env
# Django Settings
DJANGO_SECRET_KEY=your-secret-key-here-generate-a-new-one
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (PostgreSQL)
DB_NAME=sokoni_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# Use SQLite instead of PostgreSQL (for local development)
USE_SQLITE=True

# CORS - Frontend URL
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 6. Update Django Settings

In `sokoni/settings.py`, add the following:

```python
import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'your-fallback-secret-key')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    # Local apps
    'accounts',
    'products',
    'orders',
    'shops',
    'deliveries',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be first
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS Configuration
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
CORS_ALLOW_CREDENTIALS = True

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
}

# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# Database Configuration
USE_SQLITE = os.getenv('USE_SQLITE', 'True') == 'True'

if USE_SQLITE:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'sokoni_db'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', ''),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }
```

### 7. Run Migrations

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

### 8. Create Superuser

```bash
python manage.py createsuperuser
```

### 9. Run Django Development Server

```bash
python manage.py runserver
```

The backend will be available at `http://127.0.0.1:8000`

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login and get tokens |
| POST | `/api/auth/logout/` | Logout and blacklist token |
| POST | `/api/auth/token/refresh/` | Refresh access token |
| GET | `/api/auth/profile/` | Get user profile |
| PATCH | `/api/auth/profile/` | Update user profile |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/` | List all products |
| GET | `/api/products/{id}/` | Get product details |
| POST | `/api/products/` | Create product (seller) |
| PATCH | `/api/products/{id}/` | Update product (seller) |
| DELETE | `/api/products/{id}/` | Delete product (seller) |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories/` | List all categories |
| GET | `/api/categories/{id}/` | Get category details |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart/` | Get cart items |
| POST | `/api/cart/add/` | Add item to cart |
| PATCH | `/api/cart/{id}/` | Update cart item quantity |
| DELETE | `/api/cart/{id}/` | Remove item from cart |
| DELETE | `/api/cart/clear/` | Clear entire cart |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders/` | List user orders |
| POST | `/api/orders/` | Create new order |
| GET | `/api/orders/{id}/` | Get order details |
| POST | `/api/orders/{id}/cancel/` | Cancel order |

### Shops
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shops/` | List all shops |
| GET | `/api/shops/{id}/` | Get shop details |
| GET | `/api/shops/my-shop/` | Get seller's shop |
| POST | `/api/shops/` | Create shop (seller) |
| PATCH | `/api/shops/my-shop/` | Update shop (seller) |

### Deliveries (Boda Riders)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/deliveries/available/` | List available deliveries |
| GET | `/api/deliveries/active/` | Get active delivery |
| POST | `/api/deliveries/{id}/accept/` | Accept delivery |
| PATCH | `/api/deliveries/{id}/status/` | Update delivery status |

---

## User Roles

| Role | Description |
|------|-------------|
| `customer` | Can browse, purchase, and review products |
| `seller` | Can create shops, list products, manage orders |
| `boda` | Can accept and deliver orders |
| `admin` | Can manage users, shops, and platform settings |

---

## Project Structure

```
sokoni-kiganjani/          # Frontend (Next.js)
├── app/                   # App Router pages
│   ├── auth/              # Authentication pages
│   ├── products/          # Product pages
│   ├── cart/              # Cart page
│   ├── checkout/          # Checkout page
│   ├── orders/            # Order pages
│   ├── seller/            # Seller dashboard
│   ├── boda/              # Boda rider dashboard
│   └── admin/             # Admin dashboard
├── components/            # Reusable components
├── lib/                   # Utilities and API client
│   ├── api/client.ts      # Django API client
│   ├── auth/context.tsx   # Auth context provider
│   └── types.ts           # TypeScript types
└── public/                # Static assets

sokoni-backend/            # Backend (Django)
├── sokoni/                # Main project settings
├── accounts/              # User authentication app
├── products/              # Products and categories app
├── orders/                # Orders and cart app
├── shops/                 # Shops app
├── deliveries/            # Deliveries app
└── manage.py              # Django management script
```

---

## Running Both Frontend and Backend

### Terminal 1 - Backend:
```bash
cd sokoni-backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python manage.py runserver
```

### Terminal 2 - Frontend:
```bash
cd sokoni-kiganjani
npm run dev
```

---

## Troubleshooting

### CORS Issues
Make sure `django-cors-headers` is installed and configured correctly:
- `corsheaders.middleware.CorsMiddleware` must be at the top of MIDDLEWARE
- `CORS_ALLOWED_ORIGINS` must include your frontend URL

### Authentication Issues
- Ensure JWT tokens are being stored in localStorage
- Check that the `Authorization: Bearer <token>` header is being sent
- Verify token expiration settings in Django

### Database Issues
- For SQLite: Make sure `USE_SQLITE=True` in `.env`
- For PostgreSQL: Ensure PostgreSQL is running and credentials are correct

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.
