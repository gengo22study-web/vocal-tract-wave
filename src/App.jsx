import { useState, useEffect } from "react";
import "./App.css";


export default function App() {
  const L = 0.17; // 声道長 [m]
  const c = 340;  // 音速 [m/s]


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

  // 横方向を広く可視化（声道 + 口外を余裕をもって表示）
  const X_MAX = 1.6 * L;
  const x = Array.from({ length: 360 }, (_, i) => (i / 359) * X_MAX);
  /*
    声門側の注意：
    声門は「音圧源」ではなく「体積速度源」に近い。
    教育的配慮として、x=0 近傍の音圧振幅をテーパで抑制し、
    声帯が上下に大きく振動しているように“見えない”表示にする。
  */
  const sourceTaper = xi => 1 - Math.exp(-xi / (0.02 * L));
  const incidentRaw = x.map(xi =>
    xi <= L ? sourceTaper(xi) * Math.sin(omega * time - k * xi) : null
  );
  const reflectedRaw = x.map(xi =>
    xi <= L ? sourceTaper(xi) * reflection * Math.sin(omega * time + k * xi) : null
  );


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
        height="300"
        viewBox={`0 -1.2 ${X_MAX} 2.4`}
        preserveAspectRatio="none"
        style={{ background: "#f9fafb", overflow: "visible" }}
      >
        {/* 声道管の範囲 */}
        <rect
          x={0}
          y={-1.2}
          width={L}
          height={2.4}
          fill="#f0f9ff"
          stroke="#1f2937"
          strokeWidth={0.004}
        />

        {/* 声門位置 */}
        <line x1={0} x2={0} y1={-1.2} y2={1.2} stroke="#1f2937" strokeWidth={0.004} />
        {/* 口唇位置 */}
        <line x1={L} x2={L} y1={-1.2} y2={1.2} stroke="#000" strokeWidth={0.006} />
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
        青:進行波 / 桃:反射波 / 緑:定常波 / 紫:口外透過波<br />
        ※ 声門は体積速度源として表現（音圧振幅を抑制表示）
      </p>
    </div>
  );
}