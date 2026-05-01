import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  /*
    学生向けにシンプル化した版：
    ・一様断面の声道
    ・音圧のみ表示（定在波）
    ・声道長切替（男性／女性／子ども）
    ・基本周波数（発話域）
    ・減速モードあり
    ※ 粒子速度・母音断面積・詳細モデルは一旦外す
  */


  const TRACT_PRESETS = {
    male: { label: "成人男性", L: 0.17 },
    female: { label: "成人女性", L: 0.14 },
    child: { label: "子ども", L: 0.11 }
  };

  const c = 340; // 音速 [m/s]


  const [tract, setTract] = useState("male");
  const L = TRACT_PRESETS[tract].L;


  const [freq, setFreq] = useState(150);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [slow, setSlow] = useState(false);


  const omega = 2 * Math.PI * freq;
  const k = omega / c;


  // 自動再生（減速対応）
  useEffect(() => {
    if (!playing) return;
    const dt = slow ? 0.0001 : 0.0005;
    const id = setInterval(() => {
      setTime(t => (t + dt) % 0.02);
    }, 30);
    return () => clearInterval(id);
  }, [playing, slow]);

  // 空間設定（声道＋口外）
  const X_MAX = 1.4 * L;
  const x = Array.from({ length: 300 }, (_, i) => (i / 299) * X_MAX);
  // 声門は体積速度源 → 音圧は徐々に立ち上がる表示
  const sourceTaper = xi => 1 - Math.exp(-xi / (0.02 * L));

  // 音圧（進行＋反射）
  const p_inc = x.map(xi => xi <= L ? sourceTaper(xi) * Math.sin(omega * time - k * xi) : null);
  const p_ref = x.map(xi => xi <= L ? 0.8 * sourceTaper(xi) * Math.sin(omega * time + k * xi) : null);
  const p_total = x.map((_, i) => (p_inc[i] ?? 0) + (p_ref[i] ?? 0));
  const p_out = x.map(xi => xi > L ? 0.5 * Math.sin(omega * time - k * xi) : null);

  // 正規化
  const maxAmp = Math.max(
    ...p_total.filter(v => v !== null).map(v => Math.abs(v)),
    1
  );
  const field = p_total.map(v => (v === null ? null : v / maxAmp));
  const outField = p_out.map(v => (v === null ? null : v / maxAmp));
  // フォルマント（参考：一様管）
  const F1 = c / (4 * L);
  const F2 = (3 * c) / (4 * L);

  return (
    <div className="container">
      <h1>声道音響インタラクティブ教材（基礎版）</h1>


      <div className="card">
        <label>声道モデル</label>
        <select value={tract} onChange={e => setTract(e.target.value)}>
          {Object.entries(TRACT_PRESETS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}（{Math.round(v.L * 100)} cm）</option>
          ))}
        </select>


        <label>基本周波数（発話）: {freq} Hz</label>
        <input type="range" min="100" max="300" step="5"
          value={freq} onChange={e => setFreq(+e.target.value)} />


        <label>時間</label>
        <input type="range" min="0" max="0.02" step="0.0002"
          value={time} onChange={e => setTime(+e.target.value)} />


        <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
          <button onClick={() => setPlaying(p => !p)}>{playing ? "停止" : "自動再生"}</button>
          <button onClick={() => setSlow(s => !s)}>{slow ? "通常速度" : "減速モード"}</button>
        </div>
      </div>

      <svg width="100%" height="300"
        viewBox={`0 -1.2 ${X_MAX} 2.4`} preserveAspectRatio="none"
        style={{ background: "#f9fafb" }}>
        {/* 声道 */}
        <rect x={0} y={-1.2} width={L} height={2.4}
          fill="#e0f2fe" stroke="#1f2937" strokeWidth={0.004} />
        <line x1={0} x2={0} y1={-1.2} y2={1.2}
          stroke="#1f2937" strokeWidth={0.004} />
        <line x1={L} x2={L} y1={-1.2} y2={1.2}
          stroke="#000" strokeWidth={0.006} />
        {/* フォルマント（参考） */}
        <text x={0.01} y={-0.9} fontSize={0.15}>F1 ≈ {Math.round(F1)} Hz</text>
        <text x={0.01} y={-0.6} fontSize={0.15}>F2 ≈ {Math.round(F2)} Hz</text>
        {/* 音圧 */}
        {x.map((xi, i) => field[i] !== null && (
          <circle key={i} cx={xi} cy={-field[i]} r={0.004} fill="seagreen" />
        ))}
        {x.map((xi, i) => outField[i] !== null && (
          <circle key={`o${i}`} cx={xi} cy={-outField[i]} r={0.004} fill="purple" />
        ))}
      </svg>

      <p className="legend">
        青枠: 声道 / 緑: 音圧（定在波） / 紫: 口外へ進む波<br />
        ※ 一様断面・1 次元の基礎モデル
      </p>
    </div>
  );
}
