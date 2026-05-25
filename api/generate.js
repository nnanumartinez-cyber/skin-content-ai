// api/generate.js

const OBJECTIVES = {
  viral: "El contenido debe generar alto impacto viral: datos que sorprenden, afirmaciones que generan debate o curiosidad, estructuras que hacen que la gente lo guarde y comparta.",
  ventas: "El contenido debe convertir: mostrar el valor del tratamiento, el antes/después transformador, y terminar con una llamada a la acción clara y directa para reservar turno.",
  educativo: "El contenido debe posicionar a la profesional como referente indiscutible: datos con base científica, mitos desmontados con evidencia, consejos que la audiencia no encontraría en otro lado."
};

function buildPrompt(type, objective, service, topic) {
  const tono = `Sos una cosmetóloga experta con más de 10 años de experiencia. Tu comunicación es profesional, confiable y con autoridad. Hablás en español rioplatense argentino (usás "vos", "te", etc). Nunca suenas genérica ni robótica. Cada texto debe sentirse como si lo escribiera una profesional real que conoce profundamente su área.`;
  const objectiveText = OBJECTIVES[objective] || "";

  const types = {
    hook: `Generá 5 hooks distintos para Reel/TikTok sobre "${topic}" del servicio "${service}". ${objectiveText} Cada hook: máximo 2 oraciones, primera frase que detenga el scroll en menos de 3 segundos. Formato: numerados del 1 al 5, sin títulos ni explicaciones.`,
    caption: `Generá 4 captions para Instagram sobre "${topic}" del servicio "${service}". ${objectiveText} Cada caption: 4-7 líneas, máximo 3 emojis estratégicamente ubicados, llamada a la acción al final, 5-7 hashtags relevantes. Formato: numerados, separados por línea en blanco.`,
    story: `Generá 6 frases para Stories de Instagram sobre "${topic}" del servicio "${service}". ${objectiveText} Cada frase: máximo 8 palabras, debe funcionar sola sin contexto, impacto inmediato. Una por línea, sin numeración ni explicaciones.`,
    whatsapp: `Generá 3 mensajes de WhatsApp sobre "${service}" relacionado con "${topic}". ${objectiveText} Cada mensaje: tono personal y cercano pero profesional, 3-5 oraciones, sin sonar a spam. Formato: numerados, separados por línea en blanco.`,
    guion: `Creá un guion completo para Reel de 30-45 segundos sobre "${topic}" del servicio "${service}". ${objectiveText}\n\nUsá esta estructura exacta:\n🎬 HOOK (primeros 3 segundos — frase que paraliza el scroll)\n🗣️ DESARROLLO (el cuerpo, con indicaciones visuales entre paréntesis)\n💡 VALOR (el dato o transformación que demuestra expertise)\n📢 CIERRE + CTA (llamada a la acción concreta)\n\nAl final: 5 hashtags sugeridos.`,
    imagen: `Describí en inglés una imagen profesional para Instagram de una cosmetóloga experta sobre "${topic}" del servicio "${service}". ${objectiveText}\n\nGenerá 3 opciones de prompt para crear la imagen con IA (Midjourney/DALL-E). Cada prompt debe:\n- Describir la escena, iluminación, colores y estilo visual\n- Ser específico para skin care / estética profesional\n- Tener estética premium, limpia y confiable\n- Incluir al final: "professional photography, soft pink tones, clean aesthetic, beauty clinic, high quality"\n\nFormato: numerados del 1 al 3. Después de los prompts, agregá en español una sugerencia de texto para poner sobre la imagen.`
  };

  return `${tono}\n\n${types[type]}`;
}

export default async function handler(req, res) {
  // Habilitar CORS básico por si se consume desde otro dominio local
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { selType, objective, finalService, finalTopic } = req.body;

    if (!selType || !objective || !finalService || !finalTopic) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos en el cuerpo.' });
    }

    const prompt = buildPrompt(selType, objective, finalService, finalTopic);
    const apiKey = "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";

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Error de Groq:", data);
      return res.status(response.status).json({ error: "Error provenientes de la API de Groq", details: data });
    }

    const text = data?.choices?.[0]?.message?.content || "";
    return res.status(200).json({ text });

  } catch (error) {
    console.error("Fallo de ejecución:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
