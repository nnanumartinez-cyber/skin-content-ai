  const generate = async (isRegen=false) => {
    if(!objective||!selType||!finalService||!finalTopic) return;
    let cur = uses;
    if(cur>=FREE_LIMIT){ setPaywall(true); return; }

    setLoading(true);
    if(!isRegen) setStep(4);
    setResult("");

    try {
      // CONEXIÓN DIRECTA Y LIMPIA A GROQ
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization":"Bearer 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"
        },
        body: JSON.stringify({
          model:"llama-3.3-70b-versatile",
          max_tokens:1500,
          temperature: 0.7,
          messages:[{ role:"user", content: buildPrompt(selType, objective, finalService, finalTopic) }]
        })
      });
      
      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content || "";
      
      if(text) {
        setResult(text);
        const next = cur+1;
        try { await window.storage.set("sca_uses", String(next)); } catch{}
        setUses(next);
      } else {
        setResult("No se pudo generar el contenido. Intentá de nuevo.");
      }
    } catch (err) {
      console.error(err);
      setResult("Ocurrió un error en la conexión. Intentá de nuevo.");
    }
    setLoading(false);
  };
