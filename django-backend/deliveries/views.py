"""
Views for deliveries and boda riders.
"""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Sum, Count, Q
from decimal import Decimal
from .models import BodaProfile, Delivery
from .serializers import (
    BodaProfileSerializer,
    BodaProfileUpdateSerializer,
    DeliveryListSerializer,
    DeliveryDetailSerializer,
)


class IsBodaRider(permissions.BasePermission):
    """Permission class for boda riders."""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'boda'


class BodaProfileView(generics.RetrieveUpdateAPIView):
    """Get or update boda profile."""
    
    permission_classes = [IsBodaRider]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return BodaProfileUpdateSerializer
        return BodaProfileSerializer
    
    def get_object(self):
        profile, created = BodaProfile.objects.get_or_create(
            user=self.request.user,
            defaults={
                'vehicle_plate': '',
                'license_number': ''
            }
        )
        return profile


class AvailableDeliveriesView(generics.ListAPIView):
    """List available deliveries for boda riders."""
    
    serializer_class = DeliveryListSerializer
    permission_classes = [IsBodaRider]

    def get_queryset(self):
        return Delivery.objects.filter(
            status='pending',
            boda__isnull=True
        ).select_related('order')


class MyDeliveriesView(generics.ListAPIView):
    """List boda rider's deliveries."""
    
    serializer_class = DeliveryListSerializer
    permission_classes = [IsBodaRider]

    def get_queryset(self):
        try:
            boda = self.request.user.boda_profile
            queryset = Delivery.objects.filter(boda=boda)
            
            status_filter = self.request.query_params.get('status')
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            return queryset
        except BodaProfile.DoesNotExist:
            return Delivery.objects.none()


class ActiveDeliveryView(APIView):
    """Get active delivery for boda rider."""
    
    permission_classes = [IsBodaRider]
    
    def get(self, request):
        try:
            boda = request.user.boda_profile
            delivery = Delivery.objects.filter(
                boda=boda,
                status__in=['assigned', 'picked_up', 'in_transit']
            ).select_related('order', 'order__user').first()
            
            if delivery:
                return Response(DeliveryDetailSerializer(delivery).data)
            return Response(None)
        except BodaProfile.DoesNotExist:
            return Response({'error': 'Boda profile not found'}, status=status.HTTP_404_NOT_FOUND)


class AcceptDeliveryView(APIView):
    """Accept a delivery."""
    
    permission_classes = [IsBodaRider]
    
    def post(self, request, pk):
        try:
            boda = request.user.boda_profile
        except BodaProfile.DoesNotExist:
            return Response({'error': 'Boda profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if not boda.is_verified:
            return Response({'error': 'Your profile is not verified'}, status=status.HTTP_403_FORBIDDEN)
        
        if not boda.is_available:
            return Response({'error': 'You are not available'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check for active delivery
        active = Delivery.objects.filter(
            boda=boda,
            status__in=['assigned', 'picked_up', 'in_transit']
        ).exists()
        
        if active:
            return Response({'error': 'You already have an active delivery'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            delivery = Delivery.objects.get(id=pk, status='pending', boda__isnull=True)
        except Delivery.DoesNotExist:
            return Response({'error': 'Delivery not available'}, status=status.HTTP_404_NOT_FOUND)
        
        delivery.boda = boda
        delivery.status = 'assigned'
        delivery.boda_earnings = delivery.delivery_fee * Decimal('0.8')  # 80% to boda
        delivery.save()
        
        # Update order status
        delivery.order.status = 'picked_up'
        delivery.order.save()
        
        return Response({'message': 'Delivery accepted'}, status=status.HTTP_200_OK)


class UpdateDeliveryStatusView(APIView):
    """Update delivery status."""
    
    permission_classes = [IsBodaRider]
    
    def patch(self, request, pk):
        try:
            boda = request.user.boda_profile
            delivery = Delivery.objects.get(id=pk, boda=boda)
        except BodaProfile.DoesNotExist:
            return Response({'error': 'Boda profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except Delivery.DoesNotExist:
            return Response({'error': 'Delivery not found'}, status=status.HTTP_404_NOT_FOUND)
        
        new_status = request.data.get('status')
        valid_transitions = {
            'assigned': ['picked_up'],
            'picked_up': ['in_transit'],
            'in_transit': ['delivered', 'failed'],
        }
        
        if delivery.status not in valid_transitions:
            return Response({'error': 'Cannot update this delivery'}, status=status.HTTP_400_BAD_REQUEST)
        
        if new_status not in valid_transitions.get(delivery.status, []):
            return Response({'error': 'Invalid status transition'}, status=status.HTTP_400_BAD_REQUEST)
        
        delivery.status = new_status
        
        if new_status == 'picked_up':
            delivery.actual_pickup_time = timezone.now()
            delivery.order.status = 'in_transit'
        elif new_status == 'delivered':
            delivery.actual_delivery_time = timezone.now()
            delivery.order.status = 'delivered'
            # Update boda stats
            boda.total_deliveries += 1
            boda.total_earnings += delivery.boda_earnings
            boda.save()
        elif new_status == 'failed':
            delivery.order.status = 'cancelled'
        
        delivery.save()
        delivery.order.save()
        
        return Response({'message': f'Delivery status updated to {new_status}'}, status=status.HTTP_200_OK)


class BodaStatsView(APIView):
    """Get boda rider statistics."""
    
    permission_classes = [IsBodaRider]
    
    def get(self, request):
        try:
            boda = request.user.boda_profile
        except BodaProfile.DoesNotExist:
            return Response({'error': 'Boda profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        today = timezone.now().date()
        
        today_stats = Delivery.objects.filter(
            boda=boda,
            status='delivered',
            actual_delivery_time__date=today
        ).aggregate(
            count=Count('id'),
            earnings=Sum('boda_earnings')
        )
        
        return Response({
            'today_deliveries': today_stats['count'] or 0,
            'today_earnings': float(today_stats['earnings'] or 0),
            'total_deliveries': boda.total_deliveries,
            'total_earnings': float(boda.total_earnings),
            'rating': float(boda.rating)
        })
