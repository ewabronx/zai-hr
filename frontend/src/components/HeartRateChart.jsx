import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function HeartRateChart({ measurements, seriesList, selectedMeasurement }) {
  if (!measurements || measurements.length === 0) {
    return <p>Brak danych do wyświetlenia na wykresie.</p>;
  }

  // mapka serii po id (dla nazw i kolorów)
  const seriesMap = new Map(seriesList.map((s) => [s.id, s]));

  const timestamps = Array.from(
    new Set(measurements.map((m) => m.timestamp))
  ).sort();

  const data = timestamps.map((ts) => {
    const row = {
      timestampLabel: new Date(ts).toLocaleTimeString(),
    };

    measurements.forEach((m) => {
      if (m.timestamp === ts) {
        const baseKey = `series_${m.series}`;
        row[baseKey] = m.heart_rate;
        row[`${baseKey}_id`] = m.id; // <- ważne: ID pomiaru w tym punkcie
      }
    });

    return row;
  });


  // lista ID serii, które występują w danych
  const uniqueSeriesIds = Array.from(
    new Set(measurements.map((m) => m.series))
  );

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestampLabel" />
        <YAxis />
        <Tooltip />
        <Legend />
        {uniqueSeriesIds.map((id) => {
          const s = seriesMap.get(id);
          const dataKey = `series_${id}`;
          const color = s?.color || "#8884d8";

          return (
            <Line
              key={id}
              type="monotone"
              dataKey={dataKey}
              name={s ? s.name : `Seria ${id}`}
              stroke={color}
              dot={(props) => {
                const { cx, cy, payload } = props;
                const pointId = payload[`${dataKey}_id`];

                const isSelected =
                  selectedMeasurement && pointId === selectedMeasurement.id;

                const r = isSelected ? 6 : 2;
                const strokeWidth = isSelected ? 2 : 1;

                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill={color}
                  />
                );
              }}
            />
          );
        })}

      </LineChart>
    </ResponsiveContainer>
  );
}

export default HeartRateChart;
