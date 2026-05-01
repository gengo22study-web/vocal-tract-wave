

import { useState, useEffect } from "react";
import "./App.css";
export default function App() {
  const L = 0.17; // 声道長 [m]
  const c = 340; // 音速 [m/s]

  const [freq, setFreq] = useState(500);
  const [reflection, setReflection] = useState(0.8);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const omega = 2 * Math.PI * freq;
  const k = omega / c;

  // 自動再生（時間進行）
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setTime(t => (t + 0.0005) % 0.02);
    }, 30);
    return () => clearInterval(id);
  }, [playing]);


  const x = Array.from({ length: 300 }, (_, i) => (i / 299) * L * 1.3);

  const incidentRaw = x.map(xi => xi <= L ? Math.sin(omega * time - k * xi) : null);
  const reflectedRaw = x.map(xi => xi <= L ? reflection * Math.sin(omega * time + k * xi) : null);
  const totalRaw = x.map((_, i) => (incidentRaw[i] ?? 0) + (reflectedRaw[i] ?? 0));
  const transmittedRaw = x.map(xi => xi > L ? 0.5 * Math.sin(omega * time - k * xi) : null);


  // 定常波がはみ出さないよう正規化
  const maxAmp = Math.max(
    ...totalRaw.filter(v => v !== null).map(v => Math.abs(v)),
    1
  );


  const norm = v => (v === null ? null : v / maxAmp);


  const incident = incidentRaw.map(norm);
  const reflected = reflectedRaw.map(norm);
  const total = totalRaw.map(norm);
  const transmitted = transmittedRaw.map(norm);


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


        <button onClick={() => setPlaying(p => !p)}>
          {playing ? "停止" : "自動再生"}
        </button>
      </div>


      <svg
        width="100%"
        height="260"
        viewBox="0 -1.2 1.3 2.4"
        preserveAspectRatio="none"
        style={{ background: "#f9fafb", overflow: "visible" }}
      >
        {/* 声道管の範囲（背景が暗くても見えるよう明瞭化） */}
        <rect
          x={0}
          y={-1.2}
          width={L}
          height={2.4}
          fill="#f0f9ff"
          stroke="#1f2937"
          strokeWidth={0.004}
        />


        {/* 声門位置（左端） */}
        <line
          x1={0}
          x2={0}
          y1={-1.2}
          y2={1.2}
          stroke="#1f2937"
          strokeWidth={0.004}
        />


        {/* 口唇位置（明示的に強調） */}
        <line
          x1={L}
          x2={L}
          y1={-1.2}
          y2={1.2}
          stroke="#000000"
          strokeWidth={0.006}
        />


        {x.map((xi, i) => incident[i] !== null && (
          <circle key={"i" + i} cx={xi} cy={-incident[i]} r={0.004} fill="blue" />
        ))}
        {x.map((xi, i) => reflected[i] !== null && (
          <circle key={"r" + i} cx={xi} cy={-reflected[i]} r={0.004} fill="deeppink" />
        ))}
        {x.map((xi, i) => total[i] !== null && (
          <circle key={"t" + i} cx={xi} cy={-total[i]} r={0.004} fill="seagreen" />
        ))}
        {x.map((xi, i) => transmitted[i] !== null && (
          <circle key={"o" + i} cx={xi} cy={-transmitted[i]} r={0.004} fill="purple" />
        ))}
      </svg>

      <p className="legend">
        青:進行波 / 桃:反射波 / 緑:定常波 / 紫:口外透過波（自動正規化表示）
      </p>
    </div>
  );
}