"""
Serializers for products and categories.
"""
from rest_framework import serializers
from .models import Category, Product, Review


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'icon', 'parent', 'is_active', 'sort_order']


class ProductListSerializer(serializers.ModelSerializer):
    """Serializer for product list view."""
    
    shop = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)
    current_price = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'discount_price', 'current_price',
            'stock_quantity', 'images', 'is_active', 'is_featured', 'created_at',
            'shop', 'category'
        ]
    
    def get_shop(self, obj):
        return {
            'id': str(obj.shop.id),
            'name': obj.shop.name,
            'rating': obj.shop.rating
        }


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for reviews."""
    
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = ['id', 'rating', 'comment', 'user', 'created_at']
    
    def get_user(self, obj):
        return {'full_name': obj.user.full_name}


class ProductDetailSerializer(serializers.ModelSerializer):
    """Serializer for product detail view."""
    
    shop = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    current_price = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'discount_price', 'current_price',
            'stock_quantity', 'images', 'is_active', 'is_featured', 'created_at',
            'shop', 'category', 'reviews'
        ]
    
    def get_shop(self, obj):
        return {
            'id': str(obj.shop.id),
            'name': obj.shop.name,
            'rating': obj.shop.rating,
            'address': obj.shop.address
        }


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating products."""
    
    category_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = Product
        fields = [
            'name', 'description', 'price', 'discount_price',
            'stock_quantity', 'category_id', 'images', 'is_featured'
        ]
    
    def create(self, validated_data):
        category_id = validated_data.pop('category_id')
        validated_data['category_id'] = category_id
        validated_data['shop'] = self.context['request'].user.shop
        return super().create(validated_data)
