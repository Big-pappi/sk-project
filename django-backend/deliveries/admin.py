from django.contrib import admin
from .models import BodaProfile, Delivery


@admin.register(BodaProfile)
class BodaProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'vehicle_type', 'vehicle_plate', 'is_available', 'is_verified', 'rating', 'total_deliveries')
    list_filter = ('is_available', 'is_verified', 'vehicle_type')
    search_fields = ('user__email', 'vehicle_plate', 'license_number')


@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ('order', 'boda', 'status', 'delivery_fee', 'boda_earnings', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('order__id', 'boda__user__email')
