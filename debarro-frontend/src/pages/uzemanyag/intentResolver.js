import { API } from "../../api";

// intentResolver.js
// Ez a fájl a chatbot "agya".
// Most rule-based, később ez cserélődik le AI API hívásra.

export function resolveIntent(userInput) {
  const input = userInput.toLowerCase().trim();

  // --- KÉSZLET LEKÉRDEZÉS ---
  if (
    input.includes("készlet") ||
    input.includes("mennyi") ||
    input.includes("tartály") ||
    input.includes("diesel") ||
    input.includes("adblue") ||
    input.includes("gázolaj")
  ) {
    return { intent: "KESZLET_QUERY", params: {} };
  }

  // --- ISMERETLEN ---
  return { intent: "UNKNOWN", params: {} };
}

// intentResolver.js - 2. rész
// Ez hívja meg a FastAPI-t az intent alapján

export async function executeIntent(intentObj) {
  const { intent } = intentObj;

  if (intent === "KESZLET_QUERY") {
    const [tartalyok, keszlet] = await Promise.all([
      fetch(`${API}/tartaly`).then(r => r.json()),
      fetch(`${API}/keszlet`).then(r => r.json()),
    ]);

    // Összefűzzük — ugyanaz mint a Dashboard.js-ben
    const combined = tartalyok.map(t => {
      const k = keszlet.find(k => k.tartaly_id === t.tartaly_id);
      return {
        nev: t.tartaly_szam,
        anyag: t.anyag_megnevezes,
        aktualis: k ? parseFloat(k.aktualis_liter) : 0,
        kapacitas: parseFloat(t.befogado_kepesseg_l),
      };
    });

    return { type: "KESZLET", data: combined };
  }

  if (intent === "UNKNOWN") {
    return {
      type: "TEXT",
      data: 'Ezt nem értem még. Próbáld így: "Mennyi diesel van?" vagy "Mutasd a készletet"',
    };
  }
}