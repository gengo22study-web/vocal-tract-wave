import { useState } from "react";
import "./App.css";

export default function App() {
  const L = 0.17;
  const c = 340;

  const [freq, setFreq] = useState(500);
  const [reflection, setReflection] = useState(0.8);
  const [time, setTime] = useState(0);

  const omega = 2 * Math.PI * freq;
  const k = omega / c;

  const x = Array.from({ length: 300 }, (_, i) => (i / 299) * L * 1.3);

  const incident = x.map(xi => xi <= L ? Math.sin(omega * time - k * xi) : null);
  const reflected = x.map(xi => xi <= L ? reflection * Math.sin(omega * time + k * xi) : null);
  const total = x.map((_, i) => (incident[i] ?? 0) + (reflected[i] ?? 0));
  const transmitted = x.map(xi => xi > L ? 0.5 * Math.sin(omega * time - k * xi) : null);

  return (
    <div className="container">
      <h1>声道(17cm)内の音波伝搬インタラクティブ教材</h1>

      <div className="card">
        <label>周波数: {freq} Hz</label>
        <input type="range" min="100" max="2000" step="10"
          value={freq} onChange={e => setFreq(+e.target.value)} />

        <label>反射係数: {reflection.toFixed(2)}</label>
        <input type="range" min="0" max="1" step="0.05"
          value={reflection} onChange={e => setReflection(+e.target.value)} />

        <label>時間</label>
        <input type="range" min="0" max="0.02" step="0.0002"
          value={time} onChange={e => setTime(+e.target.value)} />
      </div>

      <svg width="100%" height="260" viewBox="0 -2.5 1.3 5" preserveAspectRatio="none">
        <line x1={L} x2={L} y1={-2.5} y2={2.5}
              stroke="black" strokeDasharray="4" />

        {x.map((xi, i) => incident[i] !== null &&
          <circle key={"i"+i} cx={xi} cy={-incident[i]} r={0.004} fill="blue" />)}
        {x.map((xi, i) => reflected[i] !== null &&
          <circle key={"r"+i} cx={xi} cy={-reflected[i]} r={0.004} fill="deeppink" />)}
        {x.map((xi, i) => total[i] !== null &&
          <circle key={"t"+i} cx={xi} cy={-total[i]} r={0.004} fill="seagreen" />)}
        {x.map((xi, i) => transmitted[i] !== null &&
          <circle key={"o"+i} cx={xi} cy={-transmitted[i]} r={0.004} fill="purple" />)}
      </svg>

      <p className="legend">
        青:進行波 / 桃:反射波 / 緑:定常波 / 紫:口外透過波
      </p>
    </div>
  );
}