import React, { useEffect, useState } from "react";
import { fetchSeries, fetchMeasurements } from "./api";
import MeasurementsTable from "./components/MeasurementsTable";
import HeartRateChart from "./components/HeartRateChart";


function App() {
  const [series, setSeries] = useState([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState(null);


  // Pobierz serie na start
  useEffect(() => {
    fetchSeries().then(setSeries).catch(console.error);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedSeriesId) params.series = selectedSeriesId;
      if (dateFrom) params.from = new Date(dateFrom).toISOString();
      if (dateTo) params.to = new Date(dateTo).toISOString();

      const data = await fetchMeasurements(params);

      // Dodajemy nazwę serii do pomiarów
      const enriched = data.map((m) => ({
        ...m,
        series_name: series.find((s) => s.id === m.series)?.name || "",
      }));

      setMeasurements(enriched);
    } catch (err) {
      console.error(err);
      alert("Błąd pobierania danych.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>Analiza tętna podczas treningu</h1>

      <section className="filters">
        <div>
          <label>Seria:</label>
          <select
            value={selectedSeriesId}
            onChange={(e) => setSelectedSeriesId(e.target.value)}
          >
            <option value="">Wszystkie</option>
            {series.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Od:</label>
          <input
            type="datetime-local"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div>
          <label>Do:</label>
          <input
            type="datetime-local"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <button onClick={loadData} disabled={loading}>
          {loading ? "Ładowanie..." : "Pobierz dane"}
        </button>
      </section>

      <main className="content">
        <div className="chart-container">
          <h2>Wykres tętna</h2>
          <HeartRateChart
            measurements={measurements}
            seriesList={series}
            selectedMeasurement={selectedMeasurement}
          />
        </div>

        <div className="table-container">
          <h2>Lista pomiarów</h2>
          <MeasurementsTable
            measurements={measurements}
            onSelect={setSelectedMeasurement}
            selectedMeasurement={selectedMeasurement}
          />
        </div>
      </main>
    </div>
  );

}

export default App;
