"""
URL patterns for orders app.
"""
from django.urls import path
from .views import (
    CartListView,
    CartAddView,
    CartUpdateView,
    CartDeleteView,
    CartClearView,
    CartCountView,
    OrderListView,
    OrderDetailView,
    OrderCreateView,
    OrderCancelView,
    OrderStatusUpdateView,
)

urlpatterns = [
    # Cart
    path('cart/', CartListView.as_view(), name='cart-list'),
    path('cart/add/', CartAddView.as_view(), name='cart-add'),
    path('cart/clear/', CartClearView.as_view(), name='cart-clear'),
    path('cart/count/', CartCountView.as_view(), name='cart-count'),
    path('cart/<uuid:pk>/', CartUpdateView.as_view(), name='cart-update'),
    path('cart/<uuid:pk>/delete/', CartDeleteView.as_view(), name='cart-delete'),
    
    # Orders
    path('orders/', OrderListView.as_view(), name='order-list'),
    path('orders/create/', OrderCreateView.as_view(), name='order-create'),
    path('orders/<uuid:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('orders/<uuid:pk>/cancel/', OrderCancelView.as_view(), name='order-cancel'),
    path('orders/<uuid:pk>/status/', OrderStatusUpdateView.as_view(), name='order-status'),
]
