import { useState } from "react";
import "./App.css";

export default function App() {
  /*
    学生向け教材（共鳴周波数と波形の対応）：
    ・アニメーションなし
    ・声門側：節（音圧0）
    ・口唇側：腹（音圧最大）
    ・母音ごとに代表的な共鳴周波数（F1, F2）
    ・ボタンで「どのモードの共鳴形か」を切り替える
    目的：共鳴周波数 ↔ 波の形（境界条件）の対応を視覚的に理解する
  */

  // 声道長モデル
  const TRACT_PRESETS = {
    male: { label: "成人男性", L: 0.17 },
    female: { label: "成人女性", L: 0.14 },
    child: { label: "子ども", L: 0.11 }
  };

  // 母音ごとの代表的フォルマント（教育用近似）
  const VOWELS = {
    a: { label: "/a/", F: [700, 1100] },
    i: { label: "/i/", F: [300, 2300] },
    u: { label: "/u/", F: [350, 900] }
  };

  const [tract, setTract] = useState("male");
  const [vowel, setVowel] = useState("a");
  const [mode, setMode] = useState(0); // 0 -> F1, 1 -> F2


  const L = TRACT_PRESETS[tract].L;

  // 空間（声道内のみ）
  const x = Array.from({ length: 300 }, (_, i) => i / 299);
  // 閉端（声門）– 開端（口唇）管の共鳴モード（音圧）
  // n=1 → F1, n=2 → F2
  const n = mode + 1;
  const pressure = x.map(xi => Math.sin((2 * n - 1) * Math.PI * xi / 2));


  return (
    <div className="container">
      <h1>母音と声道共鳴モードの対応</h1>
      <div className="card">
        <label>声道モデル</label>
        <select value={tract} onChange={e => setTract(e.target.value)}>
          {Object.entries(TRACT_PRESETS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}（{Math.round(v.L * 100)} cm）</option>
          ))}
        </select>

        <label>母音</label>
        <select value={vowel} onChange={e => { setVowel(e.target.value); setMode(0); }}>
          {Object.entries(VOWELS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>


        <div style={{ marginTop: "0.5rem" }}>
          <button onClick={() => setMode(0)}>F1 モード</button>
          <button onClick={() => setMode(1)}>F2 モード</button>
        </div>
      </div>


      <svg width="100%" height="300"
        viewBox="0 -1.2 1 2.4" preserveAspectRatio="none"
        style={{ background: "#f9fafb" }}>


        {/* 声道 */}
        <rect x={0} y={-1.2} width={1} height={2.4}
          fill="#e0f2fe" stroke="#1f2937" strokeWidth={0.01} />
        <line x1={0} x2={0} y1={-1.2} y2={1.2} stroke="#000" strokeWidth={0.01} />
        <line x1={1} x2={1} y1={-1.2} y2={1.2} stroke="#000" strokeWidth={0.01} />


        {/* 音圧分布 */}
        {x.map((xi, i) => (
          <circle key={i} cx={xi} cy={-pressure[i]} r={0.01} fill="seagreen" />
        ))}

        {/* 注釈 */}
        <text x={0.02} y={-1.05} fontSize={0.12}>声門（閉端・節）</text>
        <text x={0.7} y={-1.05} fontSize={0.12}>口唇（開端・腹）</text>
      </svg>

      <p className="legend">
        表示中のモード：{VOWELS[vowel].label} の F{mode + 1}（約 {VOWELS[vowel].F[mode]} Hz）<br />
        声門側は音圧の節、口唇側は音圧の腹<br />
        ※ アニメーションなし：共鳴周波数と波形の対応を示す
      </p>
    </div>
  );
}
