import React, { useState, useEffect } from "react";
import { createSeries, createMeasurement, updateMeasurement } from "../api";

function AdminPanel({ series, selectedMeasurement, onDataChanged }) {
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

  const [editingMeasurementId, setEditingMeasurementId] = useState(null);

  const [seriesErrors, setSeriesErrors] = useState([]);
  const [measurementErrors, setMeasurementErrors] = useState([]);

  const validateSeriesForm = () => {
    const errors = [];
    const min = Number(seriesForm.min_hr);
    const max = Number(seriesForm.max_hr);

    if (!seriesForm.name.trim()) {
      errors.push("Nazwa serii jest wymagana.");
    }
    if (Number.isNaN(min) || Number.isNaN(max)) {
      errors.push("Min i Max tętna muszą być liczbami.");
    } else {
      if (min <= 0 || max <= 0) {
        errors.push("Min i Max tętna muszą być większe od zera.");
      }
      if (min >= max) {
        errors.push("Minimalne tętno musi być mniejsze niż maksymalne.");
      }
    }

  return errors;
  };

  const validateMeasurementForm = () => {
    const errors = [];

    if (!measurementForm.seriesId) {
      errors.push("Wybierz serię, do której należy pomiar.");
    }

    const hr = Number(measurementForm.heart_rate);
    if (Number.isNaN(hr)) {
      errors.push("Tętno musi być liczbą.");
    } else {
      if (hr <= 0) {
        errors.push("Tętno musi być dodatnie.");
      }
      // szukamy serii, żeby sprawdzić min/max
      const s = series.find((x) => x.id === Number(measurementForm.seriesId));
      if (s) {
        if (hr < s.min_hr || hr > s.max_hr) {
          errors.push(
            `Tętno ${hr} BPM jest spoza zakresu [${s.min_hr}, ${s.max_hr}] dla serii "${s.name}".`
          );
        }
      }
    }

  if (!measurementForm.timestamp) {
    errors.push("Czas pomiaru jest wymagany.");
  }

  return errors;
};



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
  const errors = validateSeriesForm();
  setSeriesErrors(errors);

  if (errors.length > 0) {
    return; // nie wysyłamy do API
  }

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
    setSeriesErrors([]);
    onDataChanged && onDataChanged();
  } catch (err) {
    console.error(err);
    alert("Nie udało się utworzyć serii (czy na pewno jesteś adminem?).");
  }
};


const submitMeasurement = async (e) => {
  e.preventDefault();

  const errors = validateMeasurementForm();
  setMeasurementErrors(errors);

  if (errors.length > 0) {
    return; // nie wysyłamy do API
  }

  try {
    const payload = {
      series: Number(measurementForm.seriesId),
      heart_rate: Number(measurementForm.heart_rate),
      timestamp: new Date(measurementForm.timestamp).toISOString(),
    };

    if (editingMeasurementId) {
      await updateMeasurement(editingMeasurementId, payload);
      alert("Pomiar został zaktualizowany.");
    } else {
      await createMeasurement(payload);
      alert("Pomiar został dodany.");
    }

    onDataChanged && onDataChanged();
    setMeasurementErrors([]);
  } catch (err) {
    console.error(err);
    alert("Nie udało się zapisać pomiaru.");
  }
};



    const toLocalInputValue = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    const pad = (n) => String(n).padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (selectedMeasurement) {
      setMeasurementForm({
        seriesId: selectedMeasurement.series,
        heart_rate: selectedMeasurement.heart_rate,
        timestamp: toLocalInputValue(selectedMeasurement.timestamp),
      });
      setEditingMeasurementId(selectedMeasurement.id);
    } else {
      setEditingMeasurementId(null);
      setMeasurementForm({
        seriesId: "",
        heart_rate: "",
        timestamp: "",
      });
    }
  }, [selectedMeasurement]);



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
  <h3>{editingMeasurementId ? "Edytuj pomiar tętna" : "Dodaj pomiar tętna"}</h3>

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

  <button type="submit">
    {editingMeasurementId ? "Zapisz zmiany" : "Zapisz pomiar"}
  </button>

  {measurementErrors.length > 0 && (
    <ul className="form-errors">
      {measurementErrors.map((err, idx) => (
        <li key={idx}>{err}</li>
      ))}
    </ul>
  )}



</form>

      </div>
    </div>
  );
}

export default AdminPanel;
