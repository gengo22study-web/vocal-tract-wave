import { useState } from "react";
import "./App.css";

export default function App() {
  /*
    学生向け新規教材：
    "母音ごとに共鳴周波数（フォルマント）がどう変わるか"を理解するための
    超シンプル可視化。
    ・時間変化する波は扱わない
    ・声道は1次元・一様断面という前提
    ・母音ごとに代表的な F1, F2 を比較表示
    ・目的：共鳴周波数は声道形で決まる、という概念理解
  */


  // 声道長モデル（固定でもよいが比較用に残す）
  const TRACT_PRESETS = {
    male: { label: "成人男性", L: 0.17 },
    female: { label: "成人女性", L: 0.14 },
    child: { label: "子ども", L: 0.11 }
  };

  // 母音ごとの代表的フォルマント（概念用・Hz）
  // ※ 実測の平均的値を丸めた教育用近似
  const VOWELS = {
    a: { label: "/a/", F1: 700, F2: 1100 },
    i: { label: "/i/", F1: 300, F2: 2300 },
    u: { label: "/u/", F1: 350, F2: 900 }
  };


  const c = 340; // 音速 [m/s]

  const [tract, setTract] = useState("male");
  const [vowel, setVowel] = useState("a");


  const L = TRACT_PRESETS[tract].L;

  // 一様管モデルの基準フォルマント（比較用）
  const tubeF1 = c / (4 * L);
  const tubeF2 = (3 * c) / (4 * L);
  const { F1, F2 } = VOWELS[vowel];
  return (
    <div className="container">
      <h1>母音と声道共鳴周波数の関係</h1>


      <div className="card">
        <label>声道モデル</label>
        <select value={tract} onChange={e => setTract(e.target.value)}>
          {Object.entries(TRACT_PRESETS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}（{Math.round(v.L * 100)} cm）</option>
          ))}
        </select>

        <label>母音</label>
        <select value={vowel} onChange={e => setVowel(e.target.value)}>
          {Object.entries(VOWELS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>
      <svg width="100%" height="260" viewBox="0 0 3000 260"
        preserveAspectRatio="none" style={{ background: "#f9fafb" }}>
        {/* 周波数軸 */}
        <line x1={0} y1={200} x2={3000} y2={200} stroke="#111" />
        <text x={10} y={230}>周波数 (Hz)</text>
        {/* 目盛 */}
        {[0,500,1000,1500,2000,2500,3000].map(f => (
          <g key={f}>
            <line x1={f} y1={195} x2={f} y2={205} stroke="#111" />
            <text x={f + 5} y={220} fontSize={12}>{f}</text>
          </g>
        ))}
        {/* 一様管フォルマント */}
        <line x1={tubeF1} y1={60} x2={tubeF1} y2={200} stroke="#94a3b8" strokeWidth={4} />
        <text x={tubeF1 + 5} y={55} fill="#475569">管F1</text>
        <line x1={tubeF2} y1={60} x2={tubeF2} y2={200} stroke="#94a3b8" strokeWidth={4} />
        <text x={tubeF2 + 5} y={55} fill="#475569">管F2</text>
        {/* 母音フォルマント */}
        <line x1={F1} y1={100} x2={F1} y2={200} stroke="#16a34a" strokeWidth={6} />
        <text x={F1 + 5} y={95} fill="#166534">F1</text>

        <line x1={F2} y1={100} x2={F2} y2={200} stroke="#2563eb" strokeWidth={6} />
        <text x={F2 + 5} y={95} fill="#1e3a8a">F2</text>
      </svg>

      <p className="legend">
        緑: 母音の第1フォルマント (F1) / 青: 第2フォルマント (F2)<br />
        灰: 一様な管としての共鳴周波数（比較用）<br />
        ※ 共鳴周波数は声道の形（母音）で変わる
      </p>
    </div>
  );
}
