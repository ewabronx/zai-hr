import React, { useEffect, useState } from "react";
import MeasurementsTable from "./components/MeasurementsTable";
import HeartRateChart from "./components/HeartRateChart";
import { fetchSeries, fetchMeasurements, login } from "./api";
import AdminPanel from "./components/AdminPanel";



function App() {
  const [series, setSeries] = useState([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("access_token")
  );
  const [loginError, setLoginError] = useState("");
  const [visibleSeriesIds, setVisibleSeriesIds] = useState([]);



  // Pobierz serie na start
  useEffect(() => {
    fetchSeries()
      .then((data) => {
        setSeries(data);
        setVisibleSeriesIds(data.map((s) => s.id)); // wszystkie serie widoczne
      })
      .catch((err) => {
        console.error(err);
        alert("Nie udało się pobrać serii");
      });
  }, []);

  const toggleVisibleSeries = (id) => {
    setVisibleSeriesIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };


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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const tokens = await login(username, password);
      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);
      setLoggedIn(true);
      setUsername("");
      setPassword("");
      alert("Zalogowano.");
    } catch (err) {
      console.error(err);
      setLoginError("Błędne dane logowania lub brak uprawnień.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setLoggedIn(false);
    alert("Wylogowano.");
  };

  const filteredMeasurements =
    visibleSeriesIds.length === 0
      ? measurements
      : measurements.filter((m) => visibleSeriesIds.includes(m.series));

  const computeStats = (measurements) => {
  if (!measurements || measurements.length === 0) {
    return null;
  }

  const hrValues = measurements.map((m) => m.heart_rate);
  const count = hrValues.length;
  const min = Math.min(...hrValues);
  const max = Math.max(...hrValues);
  const avg = hrValues.reduce((a, b) => a + b, 0) / count;

  // strefy intensywności
  const zones = {
    easy: hrValues.filter((v) => v < 120).length,
    cardio: hrValues.filter((v) => v >= 120 && v < 160).length,
    intense: hrValues.filter((v) => v >= 160).length,
  };

  return {
    count,
    min,
    max,
    avg,
    zones,
    };
  };

  const stats = computeStats(filteredMeasurements);


  return (
    <div className="app">
      <h1>Analiza tętna podczas treningu</h1>
            <section className="login-section">
        {loggedIn ? (
          <div>
            <p>Zalogowano (token w pamięci przeglądarki).</p>
            <button onClick={handleLogout}>Wyloguj</button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="login-form">
            <h3>Logowanie admina</h3>
            <label>
              Login:
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>
            <label>
              Hasło:
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button type="submit">Zaloguj</button>
            {loginError && <p className="error">{loginError}</p>}
          </form>
        )}
      </section>

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

      <section className="series-visibility">
        <h3>Serie na wykresie</h3>
        {series.length === 0 ? (
          <p>Brak serii.</p>
        ) : (
          <div className="series-checkboxes">
            {series.map((s) => (
              <label key={s.id}>
                <input
                  type="checkbox"
                  checked={visibleSeriesIds.includes(s.id)}
                  onChange={() => toggleVisibleSeries(s.id)}
                />
                {s.name}
              </label>
            ))}
          </div>
        )}
      </section>

      <main className="content">
        <div className="chart-container">
          <h2>Wykres tętna</h2>
          <HeartRateChart
            measurements={filteredMeasurements}
            seriesList={series}
            selectedMeasurement={selectedMeasurement}
          />
        </div>

        <div className="table-container">
          <h2>Lista pomiarów</h2>
          <MeasurementsTable
            measurements={filteredMeasurements}
            onSelect={setSelectedMeasurement}
            selectedMeasurement={selectedMeasurement}
          />
        </div>
      </main>

      <section className="stats">
        <h2>Statystyki</h2>

        {!stats ? (
          <p>Brak danych do analizy.</p>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <strong>Liczba pomiarów:</strong> {stats.count}
            </div>

            <div className="stat-card">
              <strong>Średnie tętno:</strong> {stats.avg.toFixed(1)} BPM
            </div>

            <div className="stat-card">
              <strong>Minimalne tętno:</strong> {stats.min} BPM
            </div>

            <div className="stat-card">
              <strong>Maksymalne tętno:</strong> {stats.max} BPM
            </div>

            <div className="stat-card">
              <strong>Strefy intensywności:</strong>
              <ul>
                <li>
                   120 BPM (lekko):{" "}
                  {((stats.zones.easy / stats.count) * 100).toFixed(1)}%
                </li>
                <li>
                  120–159 BPM (cardio):{" "}
                  {((stats.zones.cardio / stats.count) * 100).toFixed(1)}%
                </li>
                <li>
                  ≥ 160 BPM (wysoka intensywność):{" "}
                  {((stats.zones.intense / stats.count) * 100).toFixed(1)}%
                </li>
              </ul>
            </div>
          </div>
        )}
      </section>


      {loggedIn && (
        <section>
          <AdminPanel
            series={series}
            selectedMeasurement={selectedMeasurement}
            onDataChanged={() => {
              fetchSeries().then(setSeries);
            }}
          />
        </section>
      )}


    </div>
  );

}

export default App;
