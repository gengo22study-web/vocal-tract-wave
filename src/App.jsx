import { useState } from "react";
import "./App.css";

export default function App() {
  /*
    修正版ポイント：
    ✅ SVG の viewBox を固定し、内部要素だけをスケーリング
    ✅ 文字・UI が引き伸ばされない
    ✅ 声道長の違いは「声道矩形」と「波形の横スケール」だけで表現
  */

  const TRACT_PRESETS = {
    male: { label: "成人男性", L: 0.17 },
    female: { label: "成人女性", L: 0.14 },
    child: { label: "子ども", L: 0.11 }
  };

  const c = 340; // 音速 [m/s]

  const [tract, setTract] = useState("male");
  const [mode, setMode] = useState(1); // 1,2,3 次共鳴

  const L = TRACT_PRESETS[tract].L;
  const L_REF = TRACT_PRESETS.male.L;
  const scale = L / L_REF; // 相対長

  // x は常に 0〜1
  const x = Array.from({ length: 300 }, (_, i) => i / 299);

  // 共鳴モード（音圧）
  const n = mode;
  const pressure = x.map(xi => Math.sin((2 * n - 1) * Math.PI * xi / 2));

  const lambda = (4 * L) / (2 * n - 1);
  const freq = c / lambda;

  return (
    <div className="container">
      <h1>声道共鳴と波長の関係</h1>

      <div className="card">
        <label>声道モデル</label>
        <select value={tract} onChange={e => setTract(e.target.value)}>
          {Object.entries(TRACT_PRESETS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}（{Math.round(v.L * 100)} cm）</option>
          ))}
        </select>

        <div style={{ marginTop: "0.5rem" }}>
          <button onClick={() => setMode(1)}>第1共鳴（1/4 波長）</button>
          <button onClick={() => setMode(2)}>第2共鳴（3/4 波長）</button>
          <button onClick={() => setMode(3)}>第3共鳴（5/4 波長）</button>
        </div>
      </div>

      {/* ★ viewBox は固定（0〜1） */}
      <svg
        width="100%"
        height="300"
        viewBox="0 -1.2 1 2.4"
        preserveAspectRatio="xMidYMid meet"
        style={{ background: "#f9fafb" }}
      >
        {/* 声道（横だけ scale） */}
        <rect x={0} y={-1.2} width={scale} height={2.4}
          fill="#e0f2fe" stroke="#1f2937" strokeWidth={0.01} />

        <line x1={0} x2={0} y1={-1.2} y2={1.2} stroke="#000" strokeWidth={0.01} />
        <line x1={scale} x2={scale} y1={-1.2} y2={1.2} stroke="#000" strokeWidth={0.01} />

        {/* 音圧波形 */}
        {x.map((xi, i) => (
          <circle
            key={i}
            cx={xi * scale}
            cy={-pressure[i]}
            r={0.01}
            fill="seagreen"
          />
        ))}

        {/* 注釈（常に同サイズ） */}
        <text x={0.02} y={-1.05} fontSize={14}>声門（閉端・節）</text>
        <text x={Math.max(scale - 0.28, 0.55)} y={-1.05} fontSize={14}>口唇（開端・腹）</text>
      </svg>

      <p className="legend">
        声道長 L = {Math.round(L * 100)} cm（基準比 {scale.toFixed(2)}）<br />
        第 {mode} 共鳴 ： {(2 * mode - 1)}/4 波長<br />
        λ ≈ {lambda.toFixed(2)} m, f ≈ {Math.round(freq)} Hz
      </p>
    </div>
  );
}
