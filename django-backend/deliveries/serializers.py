"""
Serializers for deliveries and boda riders.
"""
from rest_framework import serializers
from .models import BodaProfile, Delivery


class BodaProfileSerializer(serializers.ModelSerializer):
    """Serializer for boda profile."""
    
    class Meta:
        model = BodaProfile
        fields = [
            'id', 'vehicle_type', 'vehicle_plate', 'license_number',
            'is_available', 'is_verified', 'rating', 'total_deliveries', 'total_earnings'
        ]


class BodaProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating boda profile."""
    
    class Meta:
        model = BodaProfile
        fields = ['vehicle_type', 'vehicle_plate', 'license_number', 'is_available']


class DeliveryListSerializer(serializers.ModelSerializer):
    """Serializer for delivery list."""
    
    order_number = serializers.SerializerMethodField()
    
    class Meta:
        model = Delivery
        fields = [
            'id', 'order_id', 'order_number', 'pickup_address', 'delivery_address',
            'distance_km', 'delivery_fee', 'status'
        ]
    
    def get_order_number(self, obj):
        return str(obj.order.id)[:8].upper()


class DeliveryDetailSerializer(serializers.ModelSerializer):
    """Serializer for delivery details."""
    
    order_number = serializers.SerializerMethodField()
    customer_name = serializers.SerializerMethodField()
    customer_phone = serializers.SerializerMethodField()
    
    class Meta:
        model = Delivery
        fields = [
            'id', 'order_id', 'order_number', 'pickup_address', 'pickup_latitude',
            'pickup_longitude', 'delivery_address', 'delivery_latitude', 'delivery_longitude',
            'customer_name', 'customer_phone', 'distance_km', 'estimated_time',
            'delivery_fee', 'boda_earnings', 'status', 'actual_pickup_time', 'actual_delivery_time'
        ]
    
    def get_order_number(self, obj):
        return str(obj.order.id)[:8].upper()
    
    def get_customer_name(self, obj):
        return obj.order.user.full_name
    
    def get_customer_phone(self, obj):
        return obj.order.user.phone
