from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from measurements.views import SeriesViewSet, MeasurementViewSet
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView



router = routers.DefaultRouter()
router.register(r'series', SeriesViewSet, basename='series')
router.register(r'measurements', MeasurementViewSet, basename='measurements')

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/', include(router.urls)),

    # JWT
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # API schema and docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]
