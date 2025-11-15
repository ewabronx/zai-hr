from rest_framework import viewsets, permissions
from django.utils.dateparse import parse_datetime

from .models import Series, Measurement
from .serializers import SeriesSerializer, MeasurementSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    - niezalogowani: tylko GET (read-only)
    - zalogowani admini (is_staff): mogą tworzyć/edytować/usuwać
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


class SeriesViewSet(viewsets.ModelViewSet):
    queryset = Series.objects.all().order_by("id")
    serializer_class = SeriesSerializer
    permission_classes = [IsAdminOrReadOnly]


class MeasurementViewSet(viewsets.ModelViewSet):
    queryset = Measurement.objects.all().order_by("timestamp")
    serializer_class = MeasurementSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()

        series_id = self.request.query_params.get("series")
        date_from = self.request.query_params.get("from")
        date_to = self.request.query_params.get("to")

        if series_id:
            qs = qs.filter(series_id=series_id)

        if date_from:
            dt_from = parse_datetime(date_from)
            if dt_from:
                qs = qs.filter(timestamp__gte=dt_from)

        if date_to:
            dt_to = parse_datetime(date_to)
            if dt_to:
                qs = qs.filter(timestamp__lte=dt_to)

        return qs
