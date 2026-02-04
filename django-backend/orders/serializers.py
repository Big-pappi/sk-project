"""
Serializers for orders and cart.
"""
from rest_framework import serializers
from .models import CartItem, Order, OrderItem, Payment
from products.serializers import ProductListSerializer


class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for cart items."""
    
    product = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = ['id', 'product_id', 'quantity', 'product']
    
    def get_product(self, obj):
        return {
            'id': str(obj.product.id),
            'name': obj.product.name,
            'price': float(obj.product.price),
            'discount_price': float(obj.product.discount_price) if obj.product.discount_price else None,
            'images': obj.product.images,
            'stock_quantity': obj.product.stock_quantity,
            'shop': {
                'id': str(obj.product.shop.id),
                'name': obj.product.shop.name
            }
        }


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items."""
    
    product = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product_id', 'quantity', 'unit_price', 'total_price', 'product']
    
    def get_product(self, obj):
        return {
            'name': obj.product_name,
            'images': [obj.product_image] if obj.product_image else []
        }


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for orders."""
    
    shop = serializers.SerializerMethodField()
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'shop_id', 'status', 'subtotal', 'delivery_fee', 'platform_fee',
            'total_amount', 'delivery_address', 'notes', 'created_at', 'shop', 'items'
        ]
    
    def get_shop(self, obj):
        return {
            'id': str(obj.shop.id),
            'name': obj.shop.name
        }


class OrderCreateSerializer(serializers.Serializer):
    """Serializer for creating orders."""
    
    delivery_address = serializers.CharField()
    phone = serializers.CharField()
    notes = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.CharField()
