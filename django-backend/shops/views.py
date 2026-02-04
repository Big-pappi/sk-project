"""
Views for shops.
"""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count, Q
from .models import Shop
from .serializers import (
    ShopListSerializer,
    ShopDetailSerializer,
    ShopCreateSerializer,
    ShopUpdateSerializer,
)


class ShopListView(generics.ListAPIView):
    """List all shops."""
    
    serializer_class = ShopListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Shop.objects.filter(is_active=True)
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        verified = self.request.query_params.get('verified')
        if verified is not None:
            queryset = queryset.filter(is_verified=verified.lower() == 'true')
        
        return queryset


class ShopDetailView(generics.RetrieveAPIView):
    """Get shop details."""
    
    queryset = Shop.objects.all()
    serializer_class = ShopDetailSerializer
    permission_classes = [permissions.AllowAny]


class MyShopView(generics.RetrieveUpdateAPIView):
    """Get or update the current user's shop."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ShopUpdateSerializer
        return ShopDetailSerializer
    
    def get_object(self):
        return Shop.objects.get(owner=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        try:
            return super().retrieve(request, *args, **kwargs)
        except Shop.DoesNotExist:
            return Response(
                {'error': 'You do not have a shop yet'},
                status=status.HTTP_404_NOT_FOUND
            )


class ShopCreateView(generics.CreateAPIView):
    """Create a new shop."""
    
    serializer_class = ShopCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        if request.user.role not in ['seller', 'admin']:
            return Response(
                {'error': 'Only sellers can create shops'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if hasattr(request.user, 'shop'):
            return Response(
                {'error': 'You already have a shop'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().create(request, *args, **kwargs)


class MyShopStatsView(APIView):
    """Get shop statistics."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            shop = request.user.shop
        except Shop.DoesNotExist:
            return Response({'error': 'Shop not found'}, status=status.HTTP_404_NOT_FOUND)
        
        from orders.models import Order
        
        stats = {
            'total_products': shop.products.count(),
            'total_orders': Order.objects.filter(shop=shop).count(),
            'pending_orders': Order.objects.filter(shop=shop, status='pending').count(),
            'total_revenue': Order.objects.filter(
                shop=shop, status='delivered'
            ).aggregate(total=Sum('total_amount'))['total'] or 0
        }
        
        return Response(stats)


class MyShopOrdersView(generics.ListAPIView):
    """Get shop orders."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        from orders.serializers import OrderSerializer
        return OrderSerializer
    
    def get_queryset(self):
        from orders.models import Order
        try:
            shop = self.request.user.shop
            queryset = Order.objects.filter(shop=shop).select_related('user').prefetch_related('items')
            
            status_filter = self.request.query_params.get('status')
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            return queryset
        except Shop.DoesNotExist:
            return Order.objects.none()
