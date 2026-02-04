from django.contrib import admin
from .models import CartItem, Order, OrderItem, Payment


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'quantity', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'product__name')


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_name', 'product_image', 'unit_price', 'total_price')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'shop', 'status', 'total_amount', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__email', 'shop__name', 'delivery_address')
    inlines = [OrderItemInline]
    readonly_fields = ('subtotal', 'delivery_fee', 'platform_fee', 'total_amount', 'created_at', 'updated_at')


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('order', 'amount', 'payment_method', 'payment_status', 'created_at')
    list_filter = ('payment_status', 'payment_method')
    search_fields = ('order__id', 'transaction_id')
