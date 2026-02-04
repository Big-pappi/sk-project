"""
Management command to seed the database with initial test data.
Run with: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from products.models import Category, Product
from shops.models import Shop
from deliveries.models import BodaProfile

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with initial test data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            User.objects.filter(is_superuser=False).delete()
            Shop.objects.all().delete()
            Product.objects.all().delete()
            Category.objects.all().delete()
            BodaProfile.objects.all().delete()

        self.stdout.write('Creating test users...')
        
        # Create test users for each role
        users_data = [
            {
                'email': 'customer@sokoni.com',
                'username': 'customer',
                'password': 'customer123',
                'first_name': 'John',
                'last_name': 'Customer',
                'role': 'customer',
                'phone': '+254712345001',
            },
            {
                'email': 'seller@sokoni.com',
                'username': 'seller',
                'password': 'seller123',
                'first_name': 'Jane',
                'last_name': 'Seller',
                'role': 'seller',
                'phone': '+254712345002',
            },
            {
                'email': 'seller2@sokoni.com',
                'username': 'seller2',
                'password': 'seller123',
                'first_name': 'Mike',
                'last_name': 'Vendor',
                'role': 'seller',
                'phone': '+254712345003',
            },
            {
                'email': 'boda@sokoni.com',
                'username': 'boda',
                'password': 'boda123',
                'first_name': 'David',
                'last_name': 'Rider',
                'role': 'boda',
                'phone': '+254712345004',
            },
            {
                'email': 'boda2@sokoni.com',
                'username': 'boda2',
                'password': 'boda123',
                'first_name': 'Peter',
                'last_name': 'Delivery',
                'role': 'boda',
                'phone': '+254712345005',
            },
            {
                'email': 'admin@sokoni.com',
                'username': 'admin_user',
                'password': 'admin123',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'admin',
                'phone': '+254712345006',
                'is_staff': True,
            },
        ]

        created_users = {}
        for user_data in users_data:
            email = user_data.pop('email')
            password = user_data.pop('password')
            
            user, created = User.objects.get_or_create(
                email=email,
                defaults=user_data
            )
            if created:
                user.set_password(password)
                user.save()
                self.stdout.write(f'  Created user: {email}')
            else:
                self.stdout.write(f'  User exists: {email}')
            
            created_users[user.role] = user

        # Create categories
        self.stdout.write('Creating categories...')
        categories_data = [
            {'name': 'Electronics', 'slug': 'electronics', 'icon': 'smartphone', 'sort_order': 1},
            {'name': 'Groceries', 'slug': 'groceries', 'icon': 'shopping-basket', 'sort_order': 2},
            {'name': 'Fashion', 'slug': 'fashion', 'icon': 'shirt', 'sort_order': 3},
            {'name': 'Home & Garden', 'slug': 'home-garden', 'icon': 'home', 'sort_order': 4},
            {'name': 'Health & Beauty', 'slug': 'health-beauty', 'icon': 'heart', 'sort_order': 5},
            {'name': 'Sports', 'slug': 'sports', 'icon': 'trophy', 'sort_order': 6},
            {'name': 'Books', 'slug': 'books', 'icon': 'book', 'sort_order': 7},
            {'name': 'Food & Drinks', 'slug': 'food-drinks', 'icon': 'utensils', 'sort_order': 8},
        ]

        categories = {}
        for cat_data in categories_data:
            cat, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            categories[cat.slug] = cat
            if created:
                self.stdout.write(f'  Created category: {cat.name}')

        # Create shops for sellers
        self.stdout.write('Creating shops...')
        
        seller_user = User.objects.filter(role='seller').first()
        if seller_user and not Shop.objects.filter(owner=seller_user).exists():
            shop1 = Shop.objects.create(
                owner=seller_user,
                name='Sokoni Electronics',
                description='Your one-stop shop for all electronics and gadgets.',
                address='Kenyatta Avenue, Nairobi',
                latitude=-1.2864,
                longitude=36.8172,
                phone='+254712345002',
                email='electronics@sokoni.com',
                is_verified=True,
                is_active=True,
            )
            self.stdout.write(f'  Created shop: {shop1.name}')

            # Create products for this shop
            products_data = [
                {
                    'name': 'Samsung Galaxy A54',
                    'description': 'Latest Samsung smartphone with amazing camera',
                    'price': 45000.00,
                    'discount_price': 42000.00,
                    'stock_quantity': 25,
                    'category': categories.get('electronics'),
                    'is_featured': True,
                },
                {
                    'name': 'Wireless Earbuds Pro',
                    'description': 'High quality wireless earbuds with noise cancellation',
                    'price': 3500.00,
                    'stock_quantity': 50,
                    'category': categories.get('electronics'),
                },
                {
                    'name': 'Laptop Stand',
                    'description': 'Ergonomic aluminum laptop stand',
                    'price': 2500.00,
                    'stock_quantity': 30,
                    'category': categories.get('electronics'),
                },
            ]

            for prod_data in products_data:
                prod = Product.objects.create(shop=shop1, **prod_data)
                self.stdout.write(f'    Created product: {prod.name}')

        seller2 = User.objects.filter(role='seller', email='seller2@sokoni.com').first()
        if seller2 and not Shop.objects.filter(owner=seller2).exists():
            shop2 = Shop.objects.create(
                owner=seller2,
                name='Fresh Mart Groceries',
                description='Fresh groceries and farm produce delivered to your door.',
                address='Moi Avenue, Nairobi',
                latitude=-1.2833,
                longitude=36.8167,
                phone='+254712345003',
                email='freshmart@sokoni.com',
                is_verified=True,
                is_active=True,
            )
            self.stdout.write(f'  Created shop: {shop2.name}')

            products_data = [
                {
                    'name': 'Fresh Tomatoes (1kg)',
                    'description': 'Farm fresh tomatoes',
                    'price': 150.00,
                    'stock_quantity': 100,
                    'category': categories.get('groceries'),
                },
                {
                    'name': 'Organic Eggs (Tray)',
                    'description': '30 organic free-range eggs',
                    'price': 450.00,
                    'stock_quantity': 40,
                    'category': categories.get('groceries'),
                    'is_featured': True,
                },
                {
                    'name': 'Fresh Milk (1L)',
                    'description': 'Fresh pasteurized milk',
                    'price': 80.00,
                    'stock_quantity': 60,
                    'category': categories.get('groceries'),
                },
            ]

            for prod_data in products_data:
                prod = Product.objects.create(shop=shop2, **prod_data)
                self.stdout.write(f'    Created product: {prod.name}')

        # Create boda profiles
        self.stdout.write('Creating boda profiles...')
        
        boda_users = User.objects.filter(role='boda')
        for i, boda_user in enumerate(boda_users):
            if not BodaProfile.objects.filter(user=boda_user).exists():
                profile = BodaProfile.objects.create(
                    user=boda_user,
                    vehicle_type='motorcycle',
                    vehicle_plate=f'KDA {100 + i}A',
                    license_number=f'DL{12345 + i}',
                    is_verified=True,
                    is_available=True,
                    current_latitude=-1.2864 + (i * 0.01),
                    current_longitude=36.8172 + (i * 0.01),
                )
                self.stdout.write(f'  Created boda profile for: {boda_user.email}')

        self.stdout.write(self.style.SUCCESS('\nDatabase seeded successfully!'))
        self.stdout.write('\n' + '='*50)
        self.stdout.write('TEST LOGIN CREDENTIALS:')
        self.stdout.write('='*50)
        self.stdout.write('Customer: customer@sokoni.com / customer123')
        self.stdout.write('Seller:   seller@sokoni.com / seller123')
        self.stdout.write('Boda:     boda@sokoni.com / boda123')
        self.stdout.write('Admin:    admin@sokoni.com / admin123')
        self.stdout.write('='*50)
