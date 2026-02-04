"""
Models for deliveries and boda riders.
"""
from django.db import models
from django.conf import settings
import uuid


class BodaProfile(models.Model):
    """Boda rider profile model."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='boda_profile')
    vehicle_type = models.CharField(max_length=50, default='motorcycle')
    vehicle_plate = models.CharField(max_length=20)
    license_number = models.CharField(max_length=50)
    is_available = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    current_latitude = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    current_longitude = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    total_deliveries = models.IntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.0)
    total_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'boda_profiles'

    def __str__(self):
        return f"Boda: {self.user.email}"


class Delivery(models.Model):
    """Delivery model."""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('assigned', 'Assigned'),
        ('picked_up', 'Picked Up'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField('orders.Order', on_delete=models.CASCADE, related_name='delivery')
    boda = models.ForeignKey(BodaProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='deliveries')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    pickup_address = models.TextField()
    pickup_latitude = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    pickup_longitude = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    delivery_address = models.TextField()
    delivery_latitude = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    delivery_longitude = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    distance_km = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    estimated_time = models.IntegerField(blank=True, null=True)  # in minutes
    actual_pickup_time = models.DateTimeField(blank=True, null=True)
    actual_delivery_time = models.DateTimeField(blank=True, null=True)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2)
    boda_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'deliveries'
        ordering = ['-created_at']

    def __str__(self):
        return f"Delivery for Order {self.order.id}"
