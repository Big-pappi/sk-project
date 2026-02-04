# Generated migration for deliveries app

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('orders', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='BodaProfile',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('vehicle_type', models.CharField(default='motorcycle', max_length=50)),
                ('vehicle_plate', models.CharField(max_length=20)),
                ('license_number', models.CharField(max_length=50)),
                ('is_available', models.BooleanField(default=True)),
                ('is_verified', models.BooleanField(default=False)),
                ('current_latitude', models.DecimalField(blank=True, decimal_places=8, max_digits=10, null=True)),
                ('current_longitude', models.DecimalField(blank=True, decimal_places=8, max_digits=11, null=True)),
                ('total_deliveries', models.IntegerField(default=0)),
                ('rating', models.DecimalField(decimal_places=2, default=5.0, max_digits=3)),
                ('total_earnings', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='boda_profile', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'boda_profiles',
            },
        ),
        migrations.CreateModel(
            name='Delivery',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('assigned', 'Assigned'), ('picked_up', 'Picked Up'), ('in_transit', 'In Transit'), ('delivered', 'Delivered'), ('failed', 'Failed')], default='pending', max_length=20)),
                ('pickup_address', models.TextField()),
                ('pickup_latitude', models.DecimalField(blank=True, decimal_places=8, max_digits=10, null=True)),
                ('pickup_longitude', models.DecimalField(blank=True, decimal_places=8, max_digits=11, null=True)),
                ('delivery_address', models.TextField()),
                ('delivery_latitude', models.DecimalField(blank=True, decimal_places=8, max_digits=10, null=True)),
                ('delivery_longitude', models.DecimalField(blank=True, decimal_places=8, max_digits=11, null=True)),
                ('distance_km', models.DecimalField(blank=True, decimal_places=2, max_digits=6, null=True)),
                ('estimated_time', models.IntegerField(blank=True, null=True)),
                ('actual_pickup_time', models.DateTimeField(blank=True, null=True)),
                ('actual_delivery_time', models.DateTimeField(blank=True, null=True)),
                ('delivery_fee', models.DecimalField(decimal_places=2, max_digits=10)),
                ('boda_earnings', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('boda', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='deliveries', to='deliveries.bodaprofile')),
                ('order', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='delivery', to='orders.order')),
            ],
            options={
                'db_table': 'deliveries',
                'ordering': ['-created_at'],
            },
        ),
    ]
