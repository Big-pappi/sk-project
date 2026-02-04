from django.contrib import admin
from .models import Shop


@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'address', 'is_verified', 'is_active', 'rating', 'created_at')
    list_filter = ('is_verified', 'is_active')
    search_fields = ('name', 'owner__email', 'address')
    readonly_fields = ('rating', 'total_reviews', 'created_at', 'updated_at')
