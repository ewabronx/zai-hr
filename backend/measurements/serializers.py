from rest_framework import serializers
from .models import Series, Measurement


class SeriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Series
        fields = ["id", "name", "description", "min_hr", "max_hr", "color"]


class MeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Measurement
        fields = ["id", "series", "heart_rate", "timestamp"]

    def validate(self, attrs):
        series = attrs.get("series") or getattr(self.instance, "series", None)
        hr = attrs.get("heart_rate")

        if series and hr is not None:
            if hr < series.min_hr or hr > series.max_hr:
                raise serializers.ValidationError(
                    f"Tętno {hr} BPM jest spoza zakresu "
                    f"[{series.min_hr}, {series.max_hr}] dla serii '{series.name}'."
                )
        return attrs
