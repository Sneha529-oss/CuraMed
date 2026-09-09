import os
from typing import Dict, Any, List, Optional
from core.config import settings

class GeminiEducationalService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
        self.client = None
        self._init_client()

    def _init_client(self):
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                print("[Gemini Service] Successfully initialized Google GenAI Client.")
            except Exception as e:
                print(f"[Gemini Service] Warning initializing Google GenAI Client: {e}")
                self.client = None

    def generate_explanation(
        self,
        risk_level: str,
        probability_percentage: float,
        model_used: str,
        input_data: Dict[str, Any],
        top_factors: List[Dict[str, Any]]
    ) -> str:
        """
        Generates an educational, non-diagnostic explanation strictly after ML prediction.
        Falls back to comprehensive rule-based educational synthesis if Gemini is offline/unconfigured.
        """
        # Formulate fallback educational explanation first
        fallback_text = self._build_template_explanation(
            risk_level, probability_percentage, model_used, input_data, top_factors
        )

        if not self.client:
            return fallback_text

        try:
            factors_summary = "\n".join([
                f"- {f.get('label', f.get('feature'))}: Value={f.get('patient_value')}, "
                f"Status={f.get('status')}, Contribution={f.get('relative_contribution_pct')}%"
                for f in top_factors
            ])

            prompt = f"""
You are CuraMed's Educational Health AI Assistant. 
The deterministic Machine Learning model ({model_used}) has evaluated the patient's biological metrics and predicted a **{risk_level} Risk** profile ({probability_percentage}% risk probability).

Key Contributing Patient Factors:
{factors_summary}

Full Parameters:
{input_data}

TASK:
Provide a clear, empathetic, 3-paragraph educational breakdown for the user:
1. **Model Findings & Risk Profile**: Explain in plain English what the {probability_percentage}% risk score indicates based on the data.
2. **Key Factor Analysis**: Explain why the top 2-3 factors (like glucose, BMI, age) biologically affect insulin resistance or metabolic health.
3. **Actionable Educational Next Steps**: Suggest questions the user can bring to their licensed healthcare provider for routine metabolic screening.

IMPORTANT GUIDELINES:
- This is purely educational information and NOT medical advice or diagnosis.
- Do NOT alter or question the ML model's risk score.
- Keep language encouraging, professional, and accessible.
"""

            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            print(f"[Gemini Service] GenAI call encountered an issue ({e}). Serving local educational breakdown.")

        return fallback_text

    def _build_template_explanation(
        self,
        risk_level: str,
        probability_percentage: float,
        model_used: str,
        input_data: Dict[str, Any],
        top_factors: List[Dict[str, Any]]
    ) -> str:
        factor_bullets = []
        for f in top_factors[:3]:
            label = f.get('label', f.get('feature', 'Metric'))
            val = f.get('patient_value')
            status = f.get('status', 'Elevated')
            contrib = f.get('relative_contribution_pct', 0)
            factor_bullets.append(f"• **{label}**: Currently recorded at {val} ({status}), contributing approximately {contrib}% toward the risk profile variance.")

        factors_str = "\n".join(factor_bullets)

        if risk_level == "High":
            action_text = (
                "Given the elevated probability score, it is recommended to schedule a comprehensive metabolic panel "
                "(including Fasting Plasma Glucose and HbA1c testing) with a qualified physician. Emphasize low-glycemic nutrition, "
                "daily physical activity, and clinical follow-up."
            )
        elif risk_level == "Moderate":
            action_text = (
                "An intermediate risk score highlights early metabolic variance. Adopting proactive lifestyle adjustments—such as "
                "consistent moderate cardiovascular exercise, balanced macronutrient intake, and stress management—can significantly "
                "support optimal glucose homeostasis."
            )
        else:
            action_text = (
                "Your clinical biomarkers remain within typical baseline parameters. Maintaining consistent sleep hygiene, regular exercise, "
                "and periodic annual health checkups will help preserve optimal metabolic vitality."
            )

        return (
            f"### Statistical Risk Analysis ({model_used})\n"
            f"The trained {model_used} pipeline estimated a **{probability_percentage}% probability** of elevated diabetes risk, "
            f"placing this assessment in the **{risk_level} Risk** category.\n\n"
            f"### Primary Driving Factors\n"
            f"{factors_str}\n\n"
            f"### Preventative Educational Guidance\n"
            f"{action_text}\n\n"
            f"*Disclaimer: This evaluation is generated for educational and decision-support demonstration purposes only and does not constitute formal medical diagnosis or treatment advice.*"
        )

gemini_service = GeminiEducationalService()
