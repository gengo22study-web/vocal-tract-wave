import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  // === 声道モデル設定 ===
  const TRACT_PRESETS = {
    male:   { label: "成人男性", L: 0.17 },
    female: { label: "成人女性", L: 0.14 },
    child:  { label: "子ども",   L: 0.11 }
  };

  // === 母音断面積モデル（簡易・教育用） ===
  // A(x) を 0〜L で定義（相対値）
  const VOWELS = {
    a: {
      label: "/a/",
      area: x => 1.2 - 0.4 * Math.cos(Math.PI * x) // 全体的に開
    },
    i: {
      label: "/i/",
      area: x => 0.4 + 1.2 * Math.exp(-40 * (x - 0.8) ** 2) // 前方狭め＋前腔
    },
    u: {
      label: "/u/",
      area: x => 0.5 + 0.8 * Math.exp(-30 * (x - 0.3) ** 2) // 後方丸め
    }
  };

  const c = 340; // 音速 [m/s]


  // === 状態 ===
  const [tract, setTract] = useState("male");
  const L = TRACT_PRESETS[tract].L;

  const [vowel, setVowel] = useState("a");

  const [freq, setFreq] = useState(150);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [slow, setSlow] = useState(false);

  // 表示モード切替
  const [mode, setMode] = useState("pressure"); // 'pressure' | 'velocity'

  // フォルマント表示
  const [showF1, setShowF1] = useState(true);
  const [showF2, setShowF2] = useState(true);

  const omega = 2 * Math.PI * freq;
  const k = omega / c;


  // === 自動再生（減速対応） ===
  useEffect(() => {
    if (!playing) return;
    const dt = slow ? 0.0001 : 0.0005;
    const id = setInterval(() => {
      setTime(t => (t + dt) % 0.02);
    }, 30);
    return () => clearInterval(id);
  }, [playing, slow]);

  // === 空間設定 ===
  const X_MAX = 1.6 * L;
  const x = Array.from({ length: 360 }, (_, i) => (i / 359) * X_MAX);

  // === 断面積関数 A(x)（0〜1 に正規化） ===
  const A = x.map(xi => (xi <= L ? VOWELS[vowel].area(xi / L) : null));
  // 声門は体積速度源 → 音圧テーパ
  const sourceTaper = xi => 1 - Math.exp(-xi / (0.02 * L));

  // === 波の生成（断面積によるスケーリング） ===
  const p_inc = x.map((xi, i) =>
    xi <= L ? sourceTaper(xi) * Math.sin(omega * time - k * xi) / Math.sqrt(A[i] ?? 1) : null
  );
  const p_ref = x.map((xi, i) =>
    xi <= L ? 0.8 * sourceTaper(xi) * Math.sin(omega * time + k * xi) / Math.sqrt(A[i] ?? 1) : null
  );
  const p_total = x.map((_, i) => (p_inc[i] ?? 0) + (p_ref[i] ?? 0));
  const p_out = x.map(xi => xi > L ? 0.5 * Math.sin(omega * time - k * xi) : null);

  // 粒子速度（疑似）：u ∝ (p_inc − p_ref) * A
  const u_total = x.map((_, i) => (p_inc[i] ?? 0) - (p_ref[i] ?? 0));


  const fieldRaw = mode === "pressure" ? p_total : u_total;

  // === 正規化 ===
  const maxAmp = Math.max(
    ...fieldRaw.filter(v => v !== null).map(v => Math.abs(v)),
    1
  );
  const norm = v => (v === null ? null : v / maxAmp);

  const field = fieldRaw.map(norm);
  const outField = p_out.map(norm);

  // === フォルマント（閉端–開端一様管近似・参考表示） ===
  const F1 = c / (4 * L);
  const F2 = (3 * c) / (4 * L);

  return (
    <div className="container">
      <h1>声道音響インタラクティブ教材（母音断面積モデル）</h1>


      <div className="card">
        <label>声道モデル</label>
        <select value={tract} onChange={e => setTract(e.target.value)}>
          {Object.entries(TRACT_PRESETS).map(([key, v]) => (
            <option key={key} value={key}>{v.label}（{Math.round(v.L * 100)} cm）</option>
          ))}
        </select>

        <label>母音</label>
        <select value={vowel} onChange={e => setVowel(e.target.value)}>
          {Object.entries(VOWELS).map(([key, v]) => (
            <option key={key} value={key}>{v.label}</option>
          ))}
        </select>

        <label>基本周波数: {freq} Hz</label>
        <input type="range" min="100" max="300" step="5"
          value={freq} onChange={e => setFreq(+e.target.value)} />


        <label>時間</label>
        <input type="range" min="0" max="0.02" step="0.0002"
          value={time} onChange={e => setTime(+e.target.value)} />

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", marginTop: "0.5rem" }}>
          <button onClick={() => setPlaying(p => !p)}>{playing ? "停止" : "自動再生"}</button>
          <button onClick={() => setSlow(s => !s)}>{slow ? "通常速度" : "減速モード"}</button>
          <button onClick={() => setMode(m => m === "pressure" ? "velocity" : "pressure")}>
            表示: {mode === "pressure" ? "音圧" : "粒子速度"}
          </button>
          <label><input type="checkbox" checked={showF1} onChange={e => setShowF1(e.target.checked)} /> F1</label>
          <label><input type="checkbox" checked={showF2} onChange={e => setShowF2(e.target.checked)} /> F2</label>
        </div>
      </div>

      <svg width="100%" height="360" viewBox={`0 -1.4 ${X_MAX} 2.8`} preserveAspectRatio="none"
           style={{ background: "#f9fafb" }}>
        {/* 声道輪郭（断面積） */}
        {x.map((xi, i) => A[i] !== null && (
          <rect key={`a${i}`} x={xi} y={-0.1} width={X_MAX / x.length} height={0.2 * A[i]}
                fill="#e5e7eb" />
        ))}
        {/* 声道枠 */}
        <rect x={0} y={-1.4} width={L} height={2.8}
              fill="none" stroke="#1f2937" strokeWidth={0.004} />
        <line x1={0} x2={0} y1={-1.4} y2={1.4} stroke="#1f2937" strokeWidth={0.004} />
        <line x1={L} x2={L} y1={-1.4} y2={1.4} stroke="#000" strokeWidth={0.006} />


        {(showF1 || showF2) && (
          <g>
            {showF1 && <text x={0.01} y={-1.2} fontSize={0.15}>F1 ≈ {Math.round(F1)} Hz</text>}
            {showF2 && <text x={0.01} y={-0.9} fontSize={0.15}>F2 ≈ {Math.round(F2)} Hz</text>}
          </g>
        )}

        {x.map((xi, i) => field[i] !== null && (
          <circle key={`f${i}`} cx={xi} cy={-field[i]} r={0.004}
                  fill={mode === "pressure" ? "seagreen" : "orange"} />
        ))}
        {mode === "pressure" && x.map((xi, i) => outField[i] !== null && (
          <circle key={`o${i}`} cx={xi} cy={-outField[i]} r={0.004} fill="purple" />
        ))}
      </svg>

      <p className="legend">
        灰: 声道断面積分布 / 緑: 音圧 / 橙: 粒子速度 / 紫: 口外透過波<br />
        母音は断面積関数 A(x) により表現（教育用簡略モデル）
      </p>
    </div>
  );
}
