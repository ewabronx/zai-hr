import React from "react";

function MeasurementsTable({ measurements, onSelect, selectedMeasurement }) {
  if (!measurements || measurements.length === 0) {
    return <p>Brak pomiarów do wyświetlenia.</p>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Seria</th>
          <th>Tętno (BPM)</th>
          <th>Czas</th>
        </tr>
      </thead>
      <tbody>
        {measurements.map((m) => (
          <tr
            key={m.id}
            onClick={() => onSelect && onSelect(m)}
            className={
              selectedMeasurement && selectedMeasurement.id === m.id ? "selected" : ""
            }
            style={{ cursor: onSelect ? "pointer" : "default" }}
          >
            <td>{m.series_name}</td>
            <td>{m.heart_rate}</td>
            <td>{new Date(m.timestamp).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default MeasurementsTable;
