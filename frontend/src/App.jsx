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

      {loggedIn && (
        <section>
          <AdminPanel
            series={series}
            onDataChanged={() => {
              // po dodaniu serii/pomiaru – odśwież serie i dane
              fetchSeries().then(setSeries);
              // możesz też automatycznie odświeżyć pomiary:
              // loadData();
            }}
          />
        </section>
      )}


    </div>
  );

}

export default App;
