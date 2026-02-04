"""
URL patterns for shops app.
"""
from django.urls import path
from .views import (
    ShopListView,
    ShopDetailView,
    MyShopView,
    ShopCreateView,
    MyShopStatsView,
    MyShopOrdersView,
)

urlpatterns = [
    path('shops/', ShopListView.as_view(), name='shop-list'),
    path('shops/create/', ShopCreateView.as_view(), name='shop-create'),
    path('shops/my-shop/', MyShopView.as_view(), name='my-shop'),
    path('shops/my-shop/stats/', MyShopStatsView.as_view(), name='my-shop-stats'),
    path('shops/my-shop/orders/', MyShopOrdersView.as_view(), name='my-shop-orders'),
    path('shops/<uuid:pk>/', ShopDetailView.as_view(), name='shop-detail'),
]
