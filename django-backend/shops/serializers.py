"""
Serializers for shops.
"""
from rest_framework import serializers
from .models import Shop


class ShopListSerializer(serializers.ModelSerializer):
    """Serializer for shop list."""
    
    class Meta:
        model = Shop
        fields = [
            'id', 'name', 'description', 'logo_url', 'address',
            'is_verified', 'rating', 'total_reviews'
        ]


class ShopDetailSerializer(serializers.ModelSerializer):
    """Serializer for shop details."""
    
    class Meta:
        model = Shop
        fields = [
            'id', 'name', 'description', 'logo_url', 'banner_url',
            'address', 'latitude', 'longitude', 'phone', 'email',
            'is_verified', 'is_active', 'rating', 'total_reviews',
            'created_at', 'updated_at'
        ]


class ShopCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a shop."""
    
    class Meta:
        model = Shop
        fields = ['name', 'description', 'address', 'phone', 'email']
    
    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class ShopUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating a shop."""
    
    class Meta:
        model = Shop
        fields = [
            'name', 'description', 'logo_url', 'banner_url',
            'address', 'latitude', 'longitude', 'phone', 'email', 'is_active'
        ]
