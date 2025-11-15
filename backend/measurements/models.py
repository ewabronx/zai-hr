from django.db import models
from django.contrib.auth.models import User


class Series(models.Model):
    """
    Seria pomiarów tętna – np. konkretny trening:
    'Bieg 5 km 2025-11-10', 'Trening siłowy – nogi', itp.
    """
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    # Minimalne / maksymalne spodziewane tętno dla tej serii (BPM)
    min_hr = models.PositiveIntegerField(default=40)
    max_hr = models.PositiveIntegerField(default=200)

    # Kolor linii na wykresie (HEX)
    color = models.CharField(max_length=20, default="#ff0000")

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="hr_series",
    )

    def __str__(self):
        return self.name


class Measurement(models.Model):
    """
    Pojedynczy pomiar tętna (heart_rate) w BPM, z dokładnym czasem.
    """
    series = models.ForeignKey(
        Series,
        on_delete=models.CASCADE,
        related_name="measurements",
    )
    heart_rate = models.PositiveIntegerField()
    timestamp = models.DateTimeField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.series.name}: {self.heart_rate} BPM at {self.timestamp}"
