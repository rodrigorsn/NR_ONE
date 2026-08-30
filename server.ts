import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      service: "MindGuard NR-1 Psychosocial Risk Management System"
    });
  });

  // AI Suggestions endpoint for NR-1 Action Plans & Psychosocial Risk Insights
  app.post("/api/ai/generate-action-plan", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
          fallback: true,
          suggestions: [
            {
              title: "Revisão e Adequação da Carga de Trabalho",
              category: "Organizacional",
              description: "Redistribuir demandas de trabalho, definir prioridades claras e limitar a realização sistemática de horas extras no setor afetado.",
              responsible: "Coordenação de Operações / RH",
              termMonths: 3,
              measurement: "Monitoramento de horas extras e redução do índice de sobrecarga em 30% em 60 dias."
            },
            {
              title: "Programa de Capacitação de Liderança Humanizada",
              category: "Administrativa",
              description: "Treinar gestores em comunicação assertiva, resolução de conflitos internos e prevenção ao assédio moral conforme Lei 14.457/22 e NR-1.",
              responsible: "SESMT / Consultoria SST",
              termMonths: 2,
              measurement: "100% dos líderes treinados com avaliação de eficácia prática."
            },
            {
              title: "Pausas de Recuperação Psicofisiológica (NR-17)",
              category: "Ergonômica",
              description: "Instituir pausas regulares de 10 minutos a cada 2 horas de trabalho com alta demanda cognitiva ou atendimento ao público.",
              responsible: "Ergonomista / Gestão Local",
              termMonths: 1,
              measurement: "Adesão às pausas registrada e redução de queixas de fadiga mental."
            }
          ]
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const { companyName, sector, criticalDimensions, riskLevel, respondentCount } = req.body;

      const prompt = `Você é um especialista em Ergonomia, Segurança e Saúde no Trabalho (SST) e Legislação Brasileira (NR-1 Portaria MTE 1.419/2024 e NR-17).
Analise os seguintes dados de avaliação de riscos psicossociais no trabalho:
- Empresa: ${companyName || "Empresa Avaliada"}
- Setor / GHE: ${sector || "Setor Geral"}
- Nível de Risco Global: ${riskLevel || "Alto"}
- Número de Trabalhadores Expostos: ${respondentCount || "10+"}
- Dimensões Críticas Identificadas (com escore desfavorável no COPSOQ II): ${JSON.stringify(criticalDimensions || ["Sobrecarga de trabalho", "Falta de clareza de papel", "Baixo apoio da liderança"])}

Gere um Plano de Ação em formato JSON estrito, focado na hierarquia de prevenção da NR-1 (eliminação/redesenho do trabalho > proteção coletiva/organizacional > capacitação/apoio). 
Retorne APENAS um array de objetos JSON no seguinte formato:
[
  {
    "title": "Título da ação",
    "category": "Organizacional" | "Administrativa" | "Ergonômica" | "Apoio e Vigilância",
    "description": "Detalhamento da intervenção prática sobre a organização do trabalho",
    "responsible": "Cargo ou equipe responsável",
    "termMonths": número de meses de prazo (1 a 6),
    "measurement": "Forma de aferição de eficácia (indicador mensurável)"
  }
]`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "[]";
      const suggestions = JSON.parse(responseText);

      return res.json({ suggestions, fallback: false });
    } catch (error: any) {
      console.error("AI Generation error:", error);
      return res.status(500).json({ error: "Erro ao gerar recomendações de IA", details: error.message });
    }
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MindGuard NR-1 Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
