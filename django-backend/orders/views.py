"""
Views for orders and cart.
"""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from decimal import Decimal
from .models import CartItem, Order, OrderItem, Payment
from .serializers import (
    CartItemSerializer,
    OrderSerializer,
    OrderCreateSerializer,
)


# ============================================
# CART VIEWS
# ============================================

class CartListView(generics.ListAPIView):
    """List cart items."""
    
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user).select_related('product', 'product__shop')


class CartAddView(APIView):
    """Add item to cart."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        
        from products.models import Product
        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if quantity > product.stock_quantity:
            return Response({'error': 'Not enough stock'}, status=status.HTTP_400_BAD_REQUEST)
        
        cart_item, created = CartItem.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            if cart_item.quantity > product.stock_quantity:
                return Response({'error': 'Not enough stock'}, status=status.HTTP_400_BAD_REQUEST)
            cart_item.save()
        
        return Response({'message': 'Item added to cart'}, status=status.HTTP_200_OK)


class CartUpdateView(generics.UpdateAPIView):
    """Update cart item quantity."""
    
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        quantity = int(request.data.get('quantity', 1))
        
        if quantity > instance.product.stock_quantity:
            return Response({'error': 'Not enough stock'}, status=status.HTTP_400_BAD_REQUEST)
        
        instance.quantity = quantity
        instance.save()
        
        return Response(CartItemSerializer(instance).data)


class CartDeleteView(generics.DestroyAPIView):
    """Remove item from cart."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user)


class CartClearView(APIView):
    """Clear all cart items."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request):
        CartItem.objects.filter(user=request.user).delete()
        return Response({'message': 'Cart cleared'}, status=status.HTTP_200_OK)


class CartCountView(APIView):
    """Get cart item count."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        count = CartItem.objects.filter(user=request.user).count()
        return Response({'count': count})


# ============================================
# ORDER VIEWS
# ============================================

class OrderListView(generics.ListAPIView):
    """List user's orders."""
    
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Order.objects.filter(user=self.request.user).select_related('shop').prefetch_related('items')
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset


class OrderDetailView(generics.RetrieveAPIView):
    """Get order details."""
    
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).select_related('shop').prefetch_related('items')


class OrderCreateView(APIView):
    """Create a new order from cart items."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        cart_items = CartItem.objects.filter(user=request.user).select_related('product', 'product__shop')
        
        if not cart_items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Group cart items by shop
        shop_items = {}
        for item in cart_items:
            shop_id = str(item.product.shop.id)
            if shop_id not in shop_items:
                shop_items[shop_id] = {
                    'shop': item.product.shop,
                    'items': []
                }
            shop_items[shop_id]['items'].append(item)
        
        created_orders = []
        
        for shop_id, data in shop_items.items():
            shop = data['shop']
            items = data['items']
            
            # Calculate totals
            subtotal = sum(
                (item.product.discount_price or item.product.price) * item.quantity
                for item in items
            )
            delivery_fee = Decimal('500')  # Fixed delivery fee
            platform_fee = subtotal * Decimal('0.05')  # 5% platform fee
            total_amount = subtotal + delivery_fee + platform_fee
            
            # Create order
            order = Order.objects.create(
                user=request.user,
                shop=shop,
                subtotal=subtotal,
                delivery_fee=delivery_fee,
                platform_fee=platform_fee,
                total_amount=total_amount,
                delivery_address=serializer.validated_data['delivery_address'],
                notes=serializer.validated_data.get('notes', '')
            )
            
            # Create order items
            for item in items:
                price = item.product.discount_price or item.product.price
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    product_name=item.product.name,
                    product_image=item.product.images[0] if item.product.images else None,
                    quantity=item.quantity,
                    unit_price=price,
                    total_price=price * item.quantity
                )
                
                # Update stock
                item.product.stock_quantity -= item.quantity
                item.product.save()
            
            # Create payment record
            Payment.objects.create(
                order=order,
                amount=total_amount,
                payment_method=serializer.validated_data['payment_method']
            )
            
            created_orders.append(order)
        
        # Clear cart
        cart_items.delete()
        
        return Response({
            'message': f'{len(created_orders)} order(s) created successfully',
            'order_ids': [str(order.id) for order in created_orders]
        }, status=status.HTTP_201_CREATED)


class OrderCancelView(APIView):
    """Cancel an order."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            order = Order.objects.get(id=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if order.status not in ['pending', 'confirmed']:
            return Response(
                {'error': 'Cannot cancel order at this stage'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'cancelled'
        order.save()
        
        # Restore stock
        for item in order.items.all():
            if item.product:
                item.product.stock_quantity += item.quantity
                item.product.save()
        
        return Response({'message': 'Order cancelled'}, status=status.HTTP_200_OK)


class OrderStatusUpdateView(APIView):
    """Update order status (for sellers)."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, pk):
        try:
            if request.user.role == 'admin':
                order = Order.objects.get(id=pk)
            else:
                order = Order.objects.get(id=pk, shop__owner=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        
        new_status = request.data.get('status')
        valid_statuses = ['confirmed', 'preparing', 'ready', 'cancelled']
        
        if new_status not in valid_statuses:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = new_status
        order.save()
        
        return Response({'message': 'Order status updated'}, status=status.HTTP_200_OK)
