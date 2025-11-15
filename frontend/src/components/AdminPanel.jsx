import React, { useState } from "react";
import { createSeries, createMeasurement } from "../api";

function AdminPanel({ series, onDataChanged }) {
  // formularz tworzenia serii
  const [seriesForm, setSeriesForm] = useState({
    name: "",
    description: "",
    min_hr: 40,
    max_hr: 200,
    color: "#ff0000",
  });

  // formularz tworzenia pomiaru
  const [measurementForm, setMeasurementForm] = useState({
    seriesId: "",
    heart_rate: "",
    timestamp: "",
  });

  const handleSeriesChange = (e) => {
    const { name, value } = e.target;
    setSeriesForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMeasurementChange = (e) => {
    const { name, value } = e.target;
    setMeasurementForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitSeries = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: seriesForm.name,
        description: seriesForm.description,
        min_hr: Number(seriesForm.min_hr),
        max_hr: Number(seriesForm.max_hr),
        color: seriesForm.color,
      };
      await createSeries(payload);
      alert("Seria została utworzona.");
      setSeriesForm({
        name: "",
        description: "",
        min_hr: 40,
        max_hr: 200,
        color: "#ff0000",
      });
      onDataChanged && onDataChanged();
    } catch (err) {
      console.error(err);
      alert("Nie udało się utworzyć serii (czy na pewno jesteś adminem?).");
    }
  };

  const submitMeasurement = async (e) => {
    e.preventDefault();
    if (!measurementForm.seriesId) {
      alert("Wybierz serię.");
      return;
    }
    try {
      const payload = {
        series: Number(measurementForm.seriesId),
        heart_rate: Number(measurementForm.heart_rate),
        timestamp: new Date(measurementForm.timestamp).toISOString(),
      };
      await createMeasurement(payload);
      alert("Pomiar został dodany.");
      setMeasurementForm({
        seriesId: "",
        heart_rate: "",
        timestamp: "",
      });
      onDataChanged && onDataChanged();
    } catch (err) {
      console.error(err);
      alert("Nie udało się dodać pomiaru (czy na pewno jesteś adminem?).");
    }
  };

  return (
    <div className="admin-panel">
      <h2>Panel admina</h2>

      <div className="admin-forms">
        <form onSubmit={submitSeries} className="admin-form">
          <h3>Dodaj serię treningową</h3>

          <label>
            Nazwa:
            <input
              name="name"
              value={seriesForm.name}
              onChange={handleSeriesChange}
              required
            />
          </label>

          <label>
            Opis:
            <textarea
              name="description"
              value={seriesForm.description}
              onChange={handleSeriesChange}
            />
          </label>

          <label>
            Minimalne tętno (BPM):
            <input
              type="number"
              name="min_hr"
              value={seriesForm.min_hr}
              onChange={handleSeriesChange}
              required
            />
          </label>

          <label>
            Maksymalne tętno (BPM):
            <input
              type="number"
              name="max_hr"
              value={seriesForm.max_hr}
              onChange={handleSeriesChange}
              required
            />
          </label>

          <label>
            Kolor na wykresie:
            <input
              type="color"
              name="color"
              value={seriesForm.color}
              onChange={handleSeriesChange}
            />
          </label>

          <button type="submit">Zapisz serię</button>
        </form>

        <form onSubmit={submitMeasurement} className="admin-form">
          <h3>Dodaj pomiar tętna</h3>

          <label>
            Seria:
            <select
              name="seriesId"
              value={measurementForm.seriesId}
              onChange={handleMeasurementChange}
              required
            >
              <option value="">-- wybierz serię --</option>
              {series.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Tętno (BPM):
            <input
              type="number"
              name="heart_rate"
              value={measurementForm.heart_rate}
              onChange={handleMeasurementChange}
              required
            />
          </label>

          <label>
            Czas pomiaru:
            <input
              type="datetime-local"
              name="timestamp"
              value={measurementForm.timestamp}
              onChange={handleMeasurementChange}
              required
            />
          </label>

          <button type="submit">Zapisz pomiar</button>
        </form>
      </div>
    </div>
  );
}

export default AdminPanel;
