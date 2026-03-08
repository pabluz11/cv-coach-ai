import { useState } from "react";

const ROLES = [
  { value: "product_manager", label: "Product Manager" },
  { value: "software_engineer", label: "Software Engineer" },
  { value: "data_scientist", label: "Data Scientist / ML" },
  { value: "marketing", label: "Marketing / Growth" },
  { value: "ux_designer", label: "UX Designer" },
  { value: "project_manager", label: "Project Manager" },
  { value: "sales", label: "Sales" },
  { value: "finance", label: "Finance / Controlling" },
  { value: "hr", label: "HR / Rekruter" },
  { value: "cxo", label: "C-level / Dyrektor" },
];

const EXAMPLES = {
  junior: { role: "software_engineer", text: "Absolwent informatyki PW 2023. Projekty w Pythonie i React. Staż 3 miesiące frontend. Szukam pierwszej pracy jako junior dev. Angielski B2." },
  pm: { role: "product_manager", text: "Senior PM 7 lat. OLX Group 3 lata — produkt mobilny iOS/Android, retencja +28%. Wcześniej Brainly premium 0→50k płacących. MIM UW, CSPO. Figma, Amplitude, Jira, SQL." },
  career: { role: "ux_designer", text: "8 lat grafik agencja reklamowa (Wedel, Żywiec, PKO). Rok temu start UX — Google UX Certificate, 3 projekty portfolio. Figma, user research basics. Szukam juniora UX." },
};

export default function App() {
  const [cvText, setCvText] = useState("");
  const [jobText, setJobText] = useState("");
  const [role, setRole] = useState("product_manager");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const roleLabel = ROLES.find(r => r.value === role)?.label || role;

  const analyze = async () => {
    if (cvText.trim().length < 20) { setError("Wpisz treść CV."); return; }
    setLoading(true); setError(null); setResult(null);

    const jobSection = jobText.trim() ? `\nOFERTA:\n${jobText.trim()}` : `\nRola docelowa: ${roleLabel}`;

    const prompt = `Jesteś doświadczonym polskim rekruterem. Przeanalizuj CV i zwróć TYLKO czysty JSON bez żadnego tekstu przed ani po.

CV KANDYDATA:
${cvText}
${jobSection}

Zwróć dokładnie ten JSON z wypełnionymi wartościami:
{"overallScore":0,"atsScore":0,"impactScore":0,"matchScore":0,"severity":"medium","headline":"","summary":"","matchSummary":"","improvements":[{"icon":"","label":"","desc":""},{"icon":"","label":"","desc":""},{"icon":"","label":"","desc":""}],"rewrite":"","missingKeywords":["",""]}

Gdzie severity to "critical", "medium" lub "good". Pisz po polsku.`;

    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${resp.status}`);
      }

      const data = await resp.json();
      if (!data.text) throw new Error("Brak odpowiedzi z API");

      const match = data.text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error(`Nieoczekiwana odpowiedź: "${data.text.slice(0, 200)}"`);

      setResult(JSON.parse(match[0]));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const col = (s) => s >= 70 ? "#1A8C5B" : s >= 50 ? "#C48A1A" : "#D63B1F";
  const sevMap = {
    critical: ["Wymaga zmian", "#FEE2E2", "#B91C1C"],
    medium: ["Dobre podstawy", "#FEF9C3", "#92400E"],
    good: ["Solidne CV", "#DCFCE7", "#166534"],
  };

  return (
    <div style={{ fontFamily: "monospace", background: "#F7F4EF", minHeight: "100vh", fontSize: 13 }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #E2DDD8", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, background: "#D63B1F", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11 }}>CV</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>CV Coach AI</div>
            <div style={{ fontSize: 10, color: "#7A7470", letterSpacing: 1, textTransform: "uppercase" }}>FORGE · Pracuj.pl Incubator</div>
          </div>
        </div>
        <div style={{ fontSize: 10, color: "#1A8C5B", background: "#F0FDF8", border: "1px solid #A7F0D0", padding: "4px 10px" }}>Beta · AI Powered</div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 16px", display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, alignItems: "start" }}>
        <div style={{ background: "#fff", border: "1px solid #E2DDD8" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2DDD8" }}>
            <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#7A7470", marginBottom: 8 }}>📝 CV / doświadczenie</div>
            <textarea value={cvText} onChange={e => setCvText(e.target.value)}
              placeholder={"Wklej treść CV lub opisz doświadczenie...\n\nKliknij przykład poniżej →"}
              style={{ width: "100%", border: "1px solid #E2DDD8", background: "#F7F4EF", padding: "10px 12px", fontFamily: "inherit", fontSize: 12, color: "#1A1714", resize: "vertical", minHeight: 180, outline: "none", lineHeight: 1.7 }} />
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "#C4BFB8" }}>Przykłady:</span>
              {Object.entries({ junior: "Junior dev", pm: "Senior PM", career: "Zmiana kariery" }).map(([k, l]) => (
                <button key={k} onClick={() => { setCvText(EXAMPLES[k].text); setRole(EXAMPLES[k].role); }}
                  style={{ background: "none", border: "1px dashed #E2DDD8", padding: "3px 10px", fontFamily: "inherit", fontSize: 10, color: "#7A7470", cursor: "pointer" }}>{l}</button>
              ))}
            </div>
          </div>

          <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2DDD8" }}>
            <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#7A7470", marginBottom: 8 }}>
              🔗 Treść oferty z Pracuj.pl <span style={{ fontSize: 9, color: "#C4BFB8" }}>(opcjonalnie)</span>
            </div>
            <textarea value={jobText} onChange={e => setJobText(e.target.value)}
              placeholder={"Wklej treść ogłoszenia...\n\nPrzykład: Senior PM fintech, 5 lat, SQL, agile, B2+. 18-25k PLN."}
              style={{ width: "100%", border: "1px solid #E2DDD8", background: "#F7F4EF", padding: "10px 12px", fontFamily: "inherit", fontSize: 12, color: "#1A1714", resize: "vertical", minHeight: 80, outline: "none", lineHeight: 1.7 }} />
          </div>

          <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2DDD8" }}>
            <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#7A7470", marginBottom: 8 }}>🎯 Typ stanowiska</div>
            <div style={{ position: "relative" }}>
              <select value={role} onChange={e => setRole(e.target.value)}
                style={{ width: "100%", border: "1px solid #E2DDD8", background: "#F7F4EF", padding: "9px 32px 9px 12px", fontFamily: "inherit", fontSize: 12, color: "#1A1714", outline: "none", appearance: "none" }}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#7A7470" }}>↓</span>
            </div>
          </div>

          <div style={{ padding: "16px 20px" }}>
            <button onClick={analyze} disabled={loading}
              style={{ width: "100%", background: loading ? "#c0826e" : "#D63B1F", color: "#fff", border: "none", padding: 13, fontFamily: "inherit", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              {loading && <span style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />}
              {loading ? "Analizuję..." : "Analizuj CV →"}
            </button>
            {error && <div style={{ marginTop: 10, fontSize: 11, color: "#B91C1C", padding: "10px 12px", background: "#FEE2E2", border: "1px solid #FECACA", lineHeight: 1.6, wordBreak: "break-word" }}>⚠️ {error}</div>}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {!result && !loading && (
            <div style={{ background: "#fff", border: "1px solid #E2DDD8", padding: "48px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>🎯</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#7A7470", marginBottom: 6 }}>Gotowy na feedback rekrutera?</div>
              <div style={{ fontSize: 11, color: "#C4BFB8", lineHeight: 1.7 }}>Wklej CV i kliknij Analizuj.<br />Opcjonalnie dodaj treść oferty z Pracuj.pl.</div>
            </div>
          )}
          {loading && (
            <div style={{ background: "#fff", border: "1px solid #E2DDD8", padding: "40px 20px", textAlign: "center" }}>
              <div style={{ width: 32, height: 32, border: "3px solid #E2DDD8", borderTopColor: "#D63B1F", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
              <div style={{ fontWeight: 700, fontSize: 13, color: "#7A7470" }}>Analizuję profil...</div>
              <div style={{ fontSize: 11, color: "#C4BFB8", marginTop: 6 }}>Claude czyta CV jak rekruter</div>
            </div>
          )}
          {result && (() => {
            const [sevLabel, sevBg, sevFg] = sevMap[result.severity] || sevMap.medium;
            return <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#E2DDD8", border: "1px solid #E2DDD8" }}>
                {[["Wynik ogólny", result.overallScore], ["ATS Score", result.atsScore], ["Impact", result.impactScore], ["Match oferty", result.matchScore]].map(([label, val]) => (
                  <div key={label} style={{ background: "#fff", padding: "14px 16px" }}>
                    <div style={{ fontWeight: 800, fontSize: 28, lineHeight: 1, color: col(val) }}>{val ?? "—"}</div>
                    <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: "#7A7470", marginTop: 4 }}>{label} /100</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#fff", border: "1px solid #E2DDD8", padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: "#7A7470", marginBottom: 8 }}>
                  <span>Dopasowanie</span><span style={{ fontWeight: 700, color: "#1A1714" }}>{result.matchScore}%</span>
                </div>
                <div style={{ height: 6, background: "#E2DDD8" }}>
                  <div style={{ height: "100%", width: `${result.matchScore ?? 0}%`, background: col(result.matchScore) }} />
                </div>
                {result.matchSummary && <div style={{ fontSize: 11, color: "#7A7470", marginTop: 8, lineHeight: 1.6 }}>{result.matchSummary}</div>}
              </div>
              <div style={{ background: "#fff", border: "1px solid #E2DDD8" }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #E2DDD8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>Ocena rekrutera</div>
                  <div style={{ fontSize: 10, padding: "3px 8px", background: sevBg, color: sevFg, border: `1px solid ${sevFg}44` }}>{sevLabel}</div>
                </div>
                <div style={{ padding: 16 }}>
                  {result.headline && <div style={{ fontStyle: "italic", fontSize: 14, marginBottom: 10, lineHeight: 1.4 }}>"{result.headline}"</div>}
                  <div style={{ fontSize: 12, lineHeight: 1.8 }}>{result.summary}</div>
                  <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                    {(result.improvements || []).map((imp, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", border: "1px solid #E2DDD8", background: "#F7F4EF" }}>
                        <span style={{ fontSize: 16, flexShrink: 0 }}>{imp.icon}</span>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 3 }}>{imp.label}</div>
                          <div style={{ fontSize: 11, color: "#7A7470", lineHeight: 1.6 }}>{imp.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {result.missingKeywords?.length > 0 && (
                    <div style={{ marginTop: 12, padding: "10px 12px", border: "1px solid #E2DDD8", background: "#F7F4EF" }}>
                      <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: "#7A7470", marginBottom: 6 }}>Brakujące słowa kluczowe ATS</div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {result.missingKeywords.map((k, i) => (
                          <span key={i} style={{ background: "#fff", border: "1px solid #E2DDD8", padding: "2px 8px", fontSize: 10, color: "#D63B1F" }}>{k}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.rewrite && (
                    <div style={{ marginTop: 12, border: "1px solid #E2DDD8" }}>
                      <div style={{ padding: "6px 12px", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: "#7A7470", borderBottom: "1px solid #E2DDD8" }}>✨ Sugerowane podsumowanie</div>
                      <div style={{ padding: 12, fontSize: 12, lineHeight: 1.7, fontStyle: "italic" }}>{result.rewrite}</div>
                    </div>
                  )}
                </div>
              </div>
            </>;
          })()}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; }`}</style>
    </div>
  );
}
