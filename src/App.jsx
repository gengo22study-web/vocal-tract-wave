import { useState } from "react";
import "./App.css";

export default function App() {
  /*
    学生向け教材：声道共鳴と波長の関係（静的表示）

    目的：
    ・声道は「閉端（声門）– 開端（口唇）」の管としてモデル化できる
    ・第1共鳴：1/4 波長
    ・第2共鳴：3/4 波長
    ・第3共鳴：5/4 波長
    ・声道の長さが変わると、対応する波長（＝共鳴周波数）が変わる

    特徴：
    ・アニメーションなし
    ・ボタンで共鳴モード（1次・2次・3次）を切り替える
    ・波形そのものを表示して、空間構造を理解させる
  */

  // 声道長モデル
  const TRACT_PRESETS = {
    male: { label: "成人男性", L: 0.17 },
    female: { label: "成人女性", L: 0.14 },
    child: { label: "子ども", L: 0.11 }
  };

  const c = 340; // 音速 [m/s]


  const [tract, setTract] = useState("male");
  const [mode, setMode] = useState(1); // 1,2,3 次共鳴


  const L = TRACT_PRESETS[tract].L;

  // 空間（0〜L を正規化表示）
  const x = Array.from({ length: 300 }, (_, i) => i / 299);

  /*
    閉端–開端管の共鳴条件：
    L = (2n - 1) λ / 4
    → λ = 4L / (2n - 1)
    → 空間波形：sin((2n-1)πx/2)
  */
  const n = mode; // 1,2,3
  const pressure = x.map(xi => Math.sin((2 * n - 1) * Math.PI * xi / 2));

  // 対応する波長と周波数（参考表示）
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

      <svg
        width="100%"
        height="300"
        viewBox="0 -1.2 1 2.4"
        preserveAspectRatio="xMinYMin meet"
        style={{ background: "#f9fafb" }}
      >
        {/* 声道 */}
        <rect x={0} y={-1.2} width={1} height={2.4}
          fill="#e0f2fe" stroke="#1f2937" strokeWidth={0.01} />
        <line x1={0} x2={0} y1={-1.2} y2={1.2} stroke="#000" strokeWidth={0.01} />
        <line x1={1} x2={1} y1={-1.2} y2={1.2} stroke="#000" strokeWidth={0.01} />

        {/* 音圧波形 */}
        {x.map((xi, i) => (
          <circle
            key={i}
            cx={xi}
            cy={-pressure[i]}
            r={0.01}
            fill="seagreen"
          />
        ))}

        {/* 注釈（非引き伸ばし） */}
        <text x={0.02} y={-1.05} fontSize={14}>声門（閉端・節）</text>
        <text x={0.65} y={-1.05} fontSize={14}>口唇（開端・腹）</text>
      </svg>

      <p className="legend">
        第 {mode} 共鳴 ： {(2 * mode - 1)}/4 波長<br />
        λ ≈ {lambda.toFixed(2)} m, f ≈ {Math.round(freq)} Hz<br />
        声道長 L が変わると、必要な波長 λ が変化する
      </p>
    </div>
  );
}
