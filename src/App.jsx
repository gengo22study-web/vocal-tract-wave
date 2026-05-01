import { useState } from "react";
import "./App.css";

export default function App() {
  /*
    追加内容：
    ✅ 声帯側／口唇側を明示するラベルを追加
    ✅ 節（ノード）・腹（アンチノード）を視覚的マーカーで表示
    ✅ 既存の表示バランスは維持
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
  const scale = L / L_REF;

  const x = Array.from({ length: 300 }, (_, i) => i / 299);

  const n = mode;
  const pressure = x.map(xi => Math.sin((2 * n - 1) * Math.PI * xi / 2));

  // 節・腹の位置（理論値）
  const nodeX = 0; // 閉端＝常に節
  const antinodeX = 1; // 開端＝常に腹

  const lambda = (4 * L) / (2 * n - 1);
  const freq = c / lambda;

  return (
    <div className="container">
      <h1 style={{ fontSize: "1.5rem" }}>声道共鳴と波長の関係</h1>

      <div className="card" style={{ fontSize: "0.9rem" }}>
        <label>声道モデル</label>
        <select value={tract} onChange={e => setTract(e.target.value)}>
          {Object.entries(TRACT_PRESETS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}（{Math.round(v.L * 100)} cm）</option>
          ))}
        </select>

        <div style={{ marginTop: "0.5rem" }}>
          <button onClick={() => setMode(1)}>第1共鳴</button>
          <button onClick={() => setMode(2)}>第2共鳴</button>
          <button onClick={() => setMode(3)}>第3共鳴</button>
        </div>
      </div>

      <svg
        width="100%"
        height="420"
        viewBox="0 -1.4 1 2.8"
        preserveAspectRatio="xMidYMid meet"
        style={{ background: "#f9fafb" }}
      >
        {/* 声道 */}
        <rect x={0} y={-1.4} width={scale} height={2.8}
          fill="#e0f2fe" stroke="#1f2937" strokeWidth={0.01} />
        <line x1={0} x2={0} y1={-1.4} y2={1.4} stroke="#000" strokeWidth={0.01} />
        <line x1={scale} x2={scale} y1={-1.4} y2={1.4} stroke="#000" strokeWidth={0.01} />

        {/* 音圧分布 */}
        {x.map((xi, i) => (
          <circle
            key={i}
            cx={xi * scale}
            cy={-pressure[i]}
            r={0.007}
            fill="seagreen"
          />
        ))}

        {/* 節（ノード）マーカー */}
        <circle cx={nodeX} cy={0} r={0.03} fill="none" stroke="red" strokeWidth={0.01} />
        <text x={0.01} y={0.2} fontSize={10} fill="red">節</text>

        {/* 腹（アンチノード）マーカー */}
        <circle cx={scale * antinodeX} cy={0} r={0.03} fill="none" stroke="blue" strokeWidth={0.01} />
        <text x={Math.max(scale - 0.18, 0.6)} y={0.2} fontSize={10} fill="blue">腹</text>

        {/* 端点ラベル */}
        <text x={0.01} y={-1.25} fontSize={11}>声帯側（閉端）</text>
        <text x={Math.max(scale - 0.28, 0.55)} y={-1.25} fontSize={11}>口唇側（開端）</text>
      </svg>

      <p className="legend" style={{ fontSize: "0.85rem" }}>
        声道長 L = {Math.round(L * 100)} cm ／ 第 {mode} 共鳴 = {(2 * mode - 1)}/4 λ<br />
        λ ≈ {lambda.toFixed(2)} m，f ≈ {Math.round(freq)} Hz
      </p>
    </div>
  );
}
