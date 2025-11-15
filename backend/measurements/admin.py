from django.contrib import admin
from .models import Series, Measurement


@admin.register(Series)
class SeriesAdmin(admin.ModelAdmin):
    list_display = ("name", "min_hr", "max_hr", "color", "created_by")
    search_fields = ("name", )


@admin.register(Measurement)
class MeasurementAdmin(admin.ModelAdmin):
    list_display = ("series", "heart_rate", "timestamp", "created_at")
    list_filter = ("series", )
    search_fields = ("series__name", )
