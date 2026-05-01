import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  // === 声道モデル設定 ===
  const TRACT_PRESETS = {
    male:   { label: "成人男性", L: 0.17 },
    female: { label: "成人女性", L: 0.14 },
    child:  { label: "子ども",   L: 0.11 }
  };

  const c = 340; // 音速 [m/s]

  // === 状態 ===
  const [tract, setTract] = useState("male");
  const L = TRACT_PRESETS[tract].L;

  const [freq, setFreq] = useState(150); // 発話基本周波数
  const [reflection, setReflection] = useState(0.8);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);

  const omega = 2 * Math.PI * freq;
  const k = omega / c;

  // === 自動再生（時間進行） ===
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setTime(t => (t + 0.0005) % 0.02);
    }, 30);
    return () => clearInterval(id);
  }, [playing]);

  // === 空間設定（声道 + 口外余裕） ===
  const X_MAX = 1.6 * L;
  const x = Array.from({ length: 360 }, (_, i) => (i / 359) * X_MAX);

  /*
    声門は体積速度源として扱うため、
    x=0 近傍の音圧振幅をテーパで抑制
  */
  const sourceTaper = xi => 1 - Math.exp(-xi / (0.02 * L));

  const incidentRaw = x.map(xi =>
    xi <= L ? sourceTaper(xi) * Math.sin(omega * time - k * xi) : null
  );
  const reflectedRaw = x.map(xi =>
    xi <= L ? sourceTaper(xi) * reflection * Math.sin(omega * time + k * xi) : null
  );

  const totalRaw = x.map((_, i) => (incidentRaw[i] ?? 0) + (reflectedRaw[i] ?? 0));
  const transmittedRaw = x.map(xi =>
    xi > L ? 0.5 * Math.sin(omega * time - k * xi) : null
  );

  // === 正規化 ===
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
      <h1>声道長切替つき 音波伝搬インタラクティブ教材</h1>

      <div className="card">
        {/* 声道長切替 */}
        <label>声道モデル</label>
        <select value={tract} onChange={e => setTract(e.target.value)}>
          {Object.entries(TRACT_PRESETS).map(([key, v]) => (
            <option key={key} value={key}>
              {v.label}（{Math.round(v.L * 100)} cm）
            </option>
          ))}
        </select>

        {/* 基本周波数 */}
        <label>基本周波数（発話）: {freq} Hz</label>
        <input
          type="range"
          min="100"
          max="300"
          step="5"
          value={freq}
          onChange={e => setFreq(+e.target.value)}
        />

        <label>反射係数: {reflection.toFixed(2)}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={reflection}
          onChange={e => setReflection(+e.target.value)}
        />

        <label>時間</label>
        <input
          type="range"
          min="0"
          max="0.02"
          step="0.0002"
          value={time}
          onChange={e => setTime(+e.target.value)}
        />

        <button onClick={() => setPlaying(p => !p)}>
          {playing ? "停止" : "自動再生"}
        </button>
      </div>

      <svg
        width="100%"
        height="320"
        viewBox={`0 -1.2 ${X_MAX} 2.4`}
        preserveAspectRatio="none"
        style={{ background: "#f9fafb", overflow: "visible" }}
      >
        {/* 声道範囲 */}
        <rect
          x={0}
          y={-1.2}
          width={L}
          height={2.4}
          fill="#f0f9ff"
          stroke="#1f2937"
          strokeWidth={0.004}
        />

        {/* 声門・口唇位置 */}
        <line
          x1={0}
          x2={0}
          y1={-1.2}
          y2={1.2}
          stroke="#1f2937"
          strokeWidth={0.004}
        />
        <line
          x1={L}
          x2={L}
          y1={-1.2}
          y2={1.2}
          stroke="#000"
          strokeWidth={0.006}
        />

        {x.map((xi, i) => incident[i] !== null && (
          <circle key={`i${i}`} cx={xi} cy={-incident[i]} r={0.004} fill="blue" />
        ))}
        {x.map((xi, i) => reflected[i] !== null && (
          <circle key={`r${i}`} cx={xi} cy={-reflected[i]} r={0.004} fill="deeppink" />
        ))}
        {x.map((xi, i) => total[i] !== null && (
          <circle key={`t${i}`} cx={xi} cy={-total[i]} r={0.004} fill="seagreen" />
        ))}
        {x.map((xi, i) => transmitted[i] !== null && (
          <circle key={`o${i}`} cx={xi} cy={-transmitted[i]} r={0.004} fill="purple" />
        ))}
      </svg>

      <p className="legend">
        声道長切替：成人男性 / 成人女性 / 子ども<br />
        基本周波数：発話を想定（100–300 Hz）<br />
        ※ 声門は体積速度源として表現
      </p>
    </div>
  );
}