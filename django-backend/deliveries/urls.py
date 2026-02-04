"""
URL patterns for deliveries app.
"""
from django.urls import path
from .views import (
    BodaProfileView,
    AvailableDeliveriesView,
    MyDeliveriesView,
    ActiveDeliveryView,
    AcceptDeliveryView,
    UpdateDeliveryStatusView,
    BodaStatsView,
)

urlpatterns = [
    path('boda/profile/', BodaProfileView.as_view(), name='boda-profile'),
    path('deliveries/available/', AvailableDeliveriesView.as_view(), name='deliveries-available'),
    path('deliveries/my-deliveries/', MyDeliveriesView.as_view(), name='my-deliveries'),
    path('deliveries/active/', ActiveDeliveryView.as_view(), name='active-delivery'),
    path('deliveries/stats/', BodaStatsView.as_view(), name='boda-stats'),
    path('deliveries/<uuid:pk>/accept/', AcceptDeliveryView.as_view(), name='accept-delivery'),
    path('deliveries/<uuid:pk>/status/', UpdateDeliveryStatusView.as_view(), name='update-delivery-status'),
]
