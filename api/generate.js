// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [step,      setStep]    = useState(1);
  const [objective, setObj]     = useState(null);
  const [selType,   setType]    = useState(null);
  const [service,   setService] = useState("");
  const [custom,    setCustom]  = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [topic,     setTopic]   = useState("");
  const [result,    setResult]  = useState("");
  const [loading,   setLoading] = useState(false);
  const [copied,    setCopied]  = useState(false);
  const [uses,      setUses]    = useState(0);
  const [paywall,   setPaywall] = useState(false);

  useEffect(()=>{
    const load = async()=>{
      try {
        const s = await window.storage.get("sca_uses");
        const n = s ? parseInt(s.value||"0") : 0;
        setUses(n);
        if(n>=FREE_LIMIT) setPaywall(true);
      } catch { setUses(0); }
    };
    load();
  },[]);

  const finalService = service==="Otro (escribir abajo)" ? custom : service;
  const finalTopic = topic==="Otro (escribir abajo)" ? customTopic : topic;
  const objData  = OBJECTIVES.find(o=>o.id===objective);
  const typeData = CONTENT_TYPES.find(t=>t.id===selType);
  const usesLeft = Math.max(0, FREE_LIMIT - uses);

  // NUEVA FUNCIÓN GENERATE CONFIGURADA PARA GROQ
  const generate = async (isRegen=false) => {
    if(!objective||!selType||!finalService||!finalTopic) return;
    let cur = uses;
    if(cur>=FREE_LIMIT){ setPaywall(true); return; }

    setLoading(true);
    if(!isRegen) setStep(4);
    setResult("");

    try {
      // Cambiamos el endpoint al de Groq Cloud
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          // Pasamos tu API Key en los headers de autorización estándar
          "Authorization": "Bearer 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"
        },
        body: JSON.stringify({
          // Usamos uno de los modelos más potentes y rápidos de Groq
          model: "llama-3.3-70b-versatile",
          max_tokens: 1500,
          messages: [{ role: "user", content: buildPrompt(selType, objective, finalService, finalTopic) }]
        })
      });
      
      const data = await response.json();
      // Adaptamos la lectura de la respuesta a la estructura estándar de OpenAI/Groq
      const text = data?.choices?.[0]?.message?.content || "";
      
      if(text) {
        setResult(text);
        const next = cur+1;
        try { await window.storage.set("sca_uses", String(next)); } catch{}
        setUses(next);
      } else {
        setResult("No se pudo generar el contenido. Intentá de nuevo.");
      }
    } catch (error) {
      console.error(error);
      setResult("No se pudo generar el contenido. Intentá de nuevo.");
    }
    setLoading(false);
  };

  const copy = ()=>{ navigator.clipboard.writeText(result); setCopied(true); setTimeout(()=>setCopied(false),2000); };

  const reset = async()=>{
    if(uses>=FREE_LIMIT){ setPaywall(true); return; }
    setStep(1); setObj(null); setType(null); setService(""); setCustom(""); setTopic(""); setResult("");
  };

  const chip = (active)=>({
    padding:"8px 14px", borderRadius:"20px",
    border: active?"1px solid rgba(180,60,100,0.6)":"1px solid rgba(180,60,100,0.2)",
    background: active?"rgba(180,60,100,0.22)":"rgba(255,255,255,0.03)",
    color: active?"#f2c4d4":"#a06070",
    cursor:"pointer", fontSize:"13px", fontFamily:"sans-serif", transition:"all 0.2s",
  });

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#140810 0%,#260d1a 50%,#140810 100%)",fontFamily:"Georgia,serif",color:"#f5e6ec",position:"relative",overflow:"hidden"}}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fi{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .fi{animation:fi 0.3s ease forwards}
        button:active{transform:scale(0.97)}
      `}</style>
      <div style={{position:"fixed",top:"-100px",right:"-100px",width:"350px",height:"350px",borderRadius:"50%",background:"radial-gradient(circle,rgba(180,60,100,0.14) 0%,transparent 70%)",pointerEvents:"none"}}/>

      <div style={{maxWidth:"660px",margin:"0 auto",padding:"26px 18px 70px"}}>

        {/* HEADER */}
        <div style={{textAlign:"center",marginBottom:"18px"}}>
          <LogoSVG size={50}/>
          <div style={{marginTop:"10px",fontSize:"10px",letterSpacing:"4px",color:"#b05878",textTransform:"uppercase",marginBottom:"5px",fontFamily:"sans-serif"}}>✦ Para cosmetólogas que venden ✦</div>
          <h1 style={{fontSize:"clamp(24px,6vw,36px)",fontWeight:"400",margin:"0 0 3px",background:"linear-gradient(135deg,#f2c4d4 0%,#e8899e 50%,#b05878 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",lineHeight:1.2}}>Skin Content AI</h1>
          <p style={{color:"#a06070",fontSize:"12px",margin:"0 0 3px",fontStyle:"italic"}}>Contenido profesional para tu centro estético</p>
          <p style={{color:"#503040",fontSize:"10px",margin:0,fontFamily:"sans-serif"}}>by Natalia Martínez · Cosmetóloga &amp; Groq AI</p>
        </div>

        {paywall ? <div className="fi"><PaywallScreen/></div> : <>

          {/* CONTADOR */}
          <div style={{display:"flex",justifyContent:"center",marginBottom:"20px"}}>
            <div style={{padding:"7px 16px",borderRadius:"20px",background:usesLeft<=2?"rgba(224,90,58,0.15)":"rgba(180,60,100,0.1)",border:usesLeft<=2?"1px solid rgba(224,90,58,0.4)":"1px solid rgba(180,60,100,0.2)",fontSize:"12px",fontFamily:"sans-serif",color:usesLeft<=2?"#e05a3a":"#c47090"}}>
              {usesLeft===0?"⚠️  Sin generaciones gratuitas":usesLeft===1?"⚠️  Te queda 1 generación gratis":`✦  ${usesLeft} de ${FREE_LIMIT} generaciones gratuitas`}
            </div>
          </div>

          {/* STEPS */}
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",marginBottom:"28px"}}>
            {STEPS.map((label,i)=>{
              const n=i+1,done=step>n,active=step===n;
              return <div key={n} style={{display:"flex",alignItems:"center"}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"}}>
                  <div style={{width:"26px",height:"26px",borderRadius:"50%",background:(done||active)?"linear-gradient(135deg,#c96a84,#8B3A5A)":"rgba(255,255,255,0.05)",border:(!done&&!active)?"1px solid rgba(180,60,100,0.25)":"none",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",color:(done||active)?"#fff":"#704050",fontFamily:"sans-serif",fontWeight:"600",transition:"all 0.3s"}}>
                    {done?"✓":n}
                  </div>
                  <span style={{fontSize:"9px",letterSpacing:"1px",textTransform:"uppercase",color:active?"#c96a84":"#604050",fontFamily:"sans-serif",whiteSpace:"nowrap"}}>{label}</span>
                </div>
                {i<STEPS.length-1&&<div style={{width:"26px",height:"1px",background:step>n?"rgba(180,60,100,0.5)":"rgba(180,60,100,0.15)",margin:"0 4px",marginBottom:"18px"}}/>}
              </div>;
            })}
          </div>

          {/* STEP 1: OBJETIVO */}
          {step===1&&<div className="fi">
            <h2 style={{fontSize:"11px",letterSpacing:"3px",textTransform:"uppercase",color:"#c47090",marginBottom:"16px",textAlign:"center",fontFamily:"sans-serif",fontWeight:"400"}}>¿Cuál es el objetivo del contenido?</h2>
            <div style={{display:"grid",gap:"10px"}}>
              {OBJECTIVES.map(obj=>(
                <button key={obj.id} onClick={()=>{setObj(obj.id);setStep(2);}}
                  style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${obj.colorBorder}`,borderRadius:"18px",padding:"18px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:"14px",textAlign:"left",color:"#f5e6ec",transition:"all 0.2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background=obj.colorBg;e.currentTarget.style.transform="translateX(5px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.transform="translateX(0)";}}>
                  <span style={{fontSize:"30px"}}>{obj.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:"16px",color:obj.color,marginBottom:"2px"}}>{obj.label}</div>
                    <div style={{fontSize:"12px",color:"#a06070",fontFamily:"sans-serif",marginBottom:"2px"}}>{obj.desc}</div>
                    <div style={{fontSize:"11px",color:"#705060",fontFamily:"sans-serif",fontStyle:"italic"}}>{obj.hint}</div>
                  </div>
                  <span style={{color:obj.color,fontSize:"18px"}}>›</span>
                </button>
              ))}
            </div>
          </div>}

          {/* STEP 2: TIPO */}
          {step===2&&<div className="fi">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
              <button onClick={()=>setStep(1)} style={{background:"none",border:"none",color:"#a06070",cursor:"pointer",fontSize:"13px",fontFamily:"sans-serif",padding:0}}>← Volver</button>
              <div style={{padding:"5px 12px",borderRadius:"20px",background:objData?.colorBg,border:`1px solid ${objData?.colorBorder}`,fontSize:"12px",color:objData?.color,fontFamily:"sans-serif"}}>{objData?.icon} {objData?.label}</div>
            </div>
            <h2 style={{fontSize:"11px",letterSpacing:"3px",textTransform:"uppercase",color:"#c47090",marginBottom:"16px",textAlign:"center",fontFamily:"sans-serif",fontWeight:"400"}}>¿Qué tipo de contenido querés generar?</h2>
            <div style={{display:"grid",gap:"8px"}}>
              {CONTENT_TYPES.map(type=>(
                <button key={type.id} onClick={()=>{setType(type.id);setStep(3);}}
                  style={{background:"rgba(255,255,255,0.03)",border:type.featured?"1px solid rgba(180,60,100,0.45)":"1px solid rgba(180,60,100,0.2)",borderRadius:"14px",padding:"15px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:"12px",textAlign:"left",color:"#f5e6ec",transition:"all 0.2s",position:"relative"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(180,60,100,0.12)";e.currentTarget.style.transform="translateX(4px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.transform="translateX(0)";}}>
                  {type.featured&&<div style={{position:"absolute",top:"-1px",right:"12px",background:"linear-gradient(135deg,#c96a84,#8B3A5A)",borderRadius:"0 0 8px 8px",padding:"2px 10px",fontSize:"9px",letterSpacing:"1.5px",textTransform:"uppercase",color:"#fff",fontFamily:"sans-serif"}}>✦ Pro</div>}
                  <span style={{fontSize:"24px"}}>{type.icon}</span>
                  <div>
                    <div style={{fontSize:"15px",marginBottom:"2px",color:type.featured?"#f2c4d4":"#f5e6ec"}}>{type.label}</div>
                    <div style={{fontSize:"12px",color:"#a06070",fontFamily:"sans-serif"}}>{type.desc}</div>
                  </div>
                  <span style={{marginLeft:"auto",color:"#c96a84",fontSize:"16px"}}>›</span>
                </button>
              ))}
            </div>
          </div>}

          {/* STEP 3: SERVICIO Y TEMA */}
          {step===3&&<div className="fi">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
              <button onClick={()=>setStep(2)} style={{background:"none",border:"none",color:"#a06070",cursor:"pointer",fontSize:"13px",fontFamily:"sans-serif",padding:0}}>← Volver</button>
              <div style={{display:"flex",gap:"6px"}}>
                <div style={{padding:"4px 10px",borderRadius:"20px",background:objData?.colorBg,border:`1px solid ${objData?.colorBorder}`,fontSize:"11px",color:objData?.color,fontFamily:"sans-serif"}}>{objData?.icon} {objData?.label}</div>
                <div style={{padding:"4px 10px",borderRadius:"20px",background:"rgba(180,60,100,0.12)",border:"1px solid rgba(180,60,100,0.3)",fontSize:"11px",color:"#e8a0b8",fontFamily:"sans-serif"}}>{typeData?.icon} {typeData?.label}</div>
              </div>
            </div>

            {/* Info especial para imagen */}
            {selType==="imagen"&&<div style={{background:"rgba(122,156,201,0.1)",border:"1px solid rgba(122,156,201,0.3)",borderRadius:"12px",padding:"11px 14px",marginBottom:"16px",fontSize:"12px",color:"#9ab8d8",fontFamily:"sans-serif",lineHeight:1.6}}>
              🖼️ Vas a recibir <strong>3 prompts en inglés</strong> para generar tu imagen con herramientas como Midjourney, DALL-E o Adobe Firefly, más una sugerencia de texto para superponer.
            </div>}
            {selType==="guion"&&<div style={{background:"rgba(180,60,100,0.1)",border:"1px solid rgba(180,60,100,0.25)",borderRadius:"12px",padding:"11px 14px",marginBottom:"16px",fontSize:"12px",color:"#e8a0b8",fontFamily:"sans-serif",lineHeight:1.6}}>
              🎙️ Vas a recibir un <strong>guion completo con hook incluido</strong>: apertura, desarrollo, valor demostrable y CTA con indicaciones visuales.
            </div>}

            <div style={{marginBottom:"18px"}}>
              <label style={{display:"block",fontSize:"10px",letterSpacing:"3px",textTransform:"uppercase",color:"#c47090",marginBottom:"8px",fontFamily:"sans-serif"}}>Tu servicio</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                {SERVICES.map(s=><button key={s} onClick={()=>setService(s)} style={chip(service===s)}>{s}</button>)}
              </div>
              {service==="Otro (escribir abajo)"&&<input value={custom} onChange={e=>setCustom(e.target.value)} placeholder="Ej: Tratamiento de manchas..." style={{marginTop:"8px",width:"100%",padding:"10px 14px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(180,60,100,0.3)",borderRadius:"10px",color:"#f5e6ec",fontSize:"14px",fontFamily:"sans-serif",outline:"none",boxSizing:"border-box"}}/>}
            </div>

            <div style={{marginBottom:"22px"}}>
              <label style={{display:"block",fontSize:"10px",letterSpacing:"3px",textTransform:"uppercase",color:"#c47090",marginBottom:"8px",fontFamily:"sans-serif"}}>Tema del contenido</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                {TOPICS.map(t=><button key={t} onClick={()=>setTopic(t)} style={chip(topic===t)}>{t}</button>)}
              </div>
              {topic==="Otro (escribir abajo)"&&<input value={customTopic} onChange={e=>setCustomTopic(e.target.value)} placeholder="Ej: Lanzamiento de nueva sala, combo de tratamientos..." style={{marginTop:"8px",width:"100%",padding:"10px 14px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(180,60,100,0.3)",borderRadius:"10px",color:"#f5e6ec",fontSize:"14px",fontFamily:"sans-serif",outline:"none",boxSizing:"border-box"}}/>}
            </div>

            <button onClick={()=>generate(false)} disabled={!finalService||!finalTopic}
              style={{width:"100%",padding:"16px",background:(!finalService||!finalTopic)?"rgba(180,60,100,0.15)":"linear-gradient(135deg,#c96a84 0%,#8B3A5A 100%)",border:"none",borderRadius:"14px",color:(!finalService||!finalTopic)?"#a06070":"#fff",fontSize:"15px",cursor:(!finalService||!finalTopic)?"not-allowed":"pointer",fontFamily:"sans-serif",letterSpacing:"1px",boxShadow:(!finalService||!finalTopic)?"none":"0 8px 28px rgba(139,58,90,0.4)",transition:"all 0.2s"}}>
              ✨ Generar {typeData?.label} {objData?.icon}
            </button>
          </div>}

          {/* STEP 4: RESULTADO */}
          {step===4&&<div className="fi">
            {loading?(
              <div style={{textAlign:"center",padding:"60px 0"}}>
                <div style={{width:"42px",height:"42px",border:"2px solid rgba(180,60,100,0.15)",borderTop:"2px solid #c96a84",borderRadius:"50%",margin:"0 auto 16px",animation:"spin 0.9s linear infinite"}}/>
                <p style={{color:"#a06070",fontSize:"14px",fontStyle:"italic",fontFamily:"sans-serif"}}>
                  {selType==="imagen" ? "Generando prompts para tu imagen..." : "Generando contenido profesional..."}
                </p>
              </div>
            ):(
              <div>
                <div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginBottom:"12px"}}>
                  <span style={{padding:"3px 9px",borderRadius:"12px",background:objData?.colorBg,border:`1px solid ${objData?.colorBorder}`,fontSize:"11px",color:objData?.color,fontFamily:"sans-serif"}}>{objData?.icon} {objData?.label}</span>
                  <span style={{padding:"3px 9px",borderRadius:"12px",background:"rgba(180,60,100,0.1)",border:"1px solid rgba(180,60,100,0.25)",fontSize:"11px",color:"#e8a0b8",fontFamily:"sans-serif"}}>{typeData?.icon} {typeData?.label}</span>
                  <span style={{padding:"3px 9px",borderRadius:"12px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",fontSize:"11px",color:"#a06070",fontFamily:"sans-serif"}}>💆 {finalService}</span>
                </div>

                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                  <div style={{fontSize:"10px",letterSpacing:"3px",textTransform:"uppercase",color:"#c47090",fontFamily:"sans-serif"}}>
                    {selType==="imagen" ? "Tus prompts listos ✦" : "Tu contenido listo ✦"}
                  </div>
                  <button onClick={copy} style={{padding:"6px 13px",background:copied?"rgba(100,180,100,0.15)":"rgba(180,60,100,0.12)",border:copied?"1px solid rgba(100,180,100,0.35)":"1px solid rgba(180,60,100,0.3)",borderRadius:"8px",color:copied?"#90c090":"#e8a0b8",cursor:"pointer",fontSize:"12px",fontFamily:"sans-serif"}}>
                    {copied?"✓ Copiado":"Copiar todo"}
                  </button>
                </div>

                {/* Tip especial para imagen */}
                {selType==="imagen"&&<div style={{background:"rgba(122,156,201,0.08)",border:"1px solid rgba(122,156,201,0.2)",borderRadius:"10px",padding:"10px 14px",marginBottom:"12px",fontSize:"12px",color:"#9ab8d8",fontFamily:"sans-serif",lineHeight:1.6}}>
                  💡 Copiá el prompt y pegalo en <strong>Midjourney, DALL-E 3, Adobe Firefly o Canva AI</strong> para generar tu imagen.
                </div>}

                <div style={{background:"rgba(255,255,255,0.035)",border:"1px solid rgba(180,60,100,0.18)",borderRadius:"16px",padding:"22px",whiteSpace:"pre-wrap",lineHeight:"1.9",fontSize:"14px",color:"#f0d8e4",fontFamily:"sans-serif",marginBottom:"12px",maxHeight:"440px",overflowY:"auto"}}>
                  {result}
                </div>

                {usesLeft>0&&usesLeft<=3&&<div style={{textAlign:"center",marginBottom:"12px",fontSize:"11px",color:"#704050",fontFamily:"sans-serif"}}>
                  {usesLeft===1?"⚠️ Esta fue tu última generación gratuita":`✦ Te quedan ${usesLeft} generaciones gratuitas`}
                </div>}

                <div style={{display:"flex",gap:"8px"}}>
                  <button onClick={()=>generate(true)} style={{flex:1,padding:"13px",background:"rgba(180,60,100,0.12)",border:"1px solid rgba(180,60,100,0.28)",borderRadius:"12px",color:"#e8a0b8",cursor:"pointer",fontSize:"13px",fontFamily:"sans-serif"}}>🔄 Regenerar</button>
                  <button onClick={()=>setStep(3)} style={{flex:1,padding:"13px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",color:"#a06070",cursor:"pointer",fontSize:"13px",fontFamily:"sans-serif"}}>✏️ Cambiar</button>
                  <button onClick={reset} style={{flex:1,padding:"13px",background:"linear-gradient(135deg,#c96a84 0%,#8B3A5A 100%)",border:"none",borderRadius:"12px",color:"#fff",cursor:"pointer",fontSize:"13px",fontFamily:"sans-serif",boxShadow:"0 4px 18px rgba(139,58,90,0.3)"}}>✦ Nuevo</button>
                </div>
              </div>
            )}
          </div>}

          <div style={{textAlign:"center",marginTop:"36px",color:"rgba(160,96,112,0.3)",fontSize:"10px",letterSpacing:"2px",fontFamily:"sans-serif",textTransform:"uppercase"}}>
            Skin Content AI · by Natalia Martínez &amp; Groq AI
          </div>
        </>}
      </div>
    </div>
  );
}
