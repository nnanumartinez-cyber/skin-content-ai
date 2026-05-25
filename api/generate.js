   import { useState, useEffect } from "react";

const FREE_LIMIT = 7;
const MP_LINK = "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=4e3b7f79f11a4e75a8aef1550593e5eb";
const PRECIO = "$10.000 ARS / mes";

function LogoSVG({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 88 88" fill="none" style={{ display:"block", margin:"0 auto" }}>
      <defs>
        <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f2c4d4"/><stop offset="100%" stopColor="#b5607a"/></linearGradient>
        <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#e08099"/><stop offset="100%" stopColor="#8B3A5A"/></linearGradient>
      </defs>
      {[0,60,120,180,240,300].map(a=><ellipse key={a} cx="44" cy="22" rx="7" ry="13" fill="url(#lg1)" opacity={a===0||a===180?"0.9":"0.75"} transform={`rotate(${a},44,44)`}/>)}
      <circle cx="44" cy="44" r="12" fill="url(#lg2)"/>
      <circle cx="44" cy="44" r="8" fill="#140810"/>
      <path d="M44 36 L45.2 40.8 L50 42 L45.2 43.2 L44 48 L42.8 43.2 L38 42 L42.8 40.8 Z" fill="#f2c4d4"/>
    </svg>
  );
}

// ─── PROMPTS PROFESIONALES ────────────────────────────────────────────────────
function buildPrompt(type, objective, service, topic) {
  const tono = `Sos una cosmetóloga experta con más de 10 años de experiencia. Tu comunicación es profesional, confiable y con autoridad. Hablás en español rioplatense argentino (usás "vos", "te", etc). Nunca suenas genérica ni robótica. Cada texto debe sentirse como si lo escribiera una profesional real que conoce profundamente su área.`;

  const obj = {
    viral: "El contenido debe generar alto impacto viral: datos que sorprenden, afirmaciones que generan debate o curiosidad, estructuras que hacen que la gente lo guarde y comparta.",
    ventas: "El contenido debe convertir: mostrar el valor del tratamiento, el antes/después transformador, y terminar con una llamada a la acción clara y directa para reservar turno.",
    educativo: "El contenido debe posicionar a la profesional como referente indiscutible: datos con base científica, mitos desmontados con evidencia, consejos que la audiencia no encontraría en otro lado."
  };

  const types = {
    hook: `Generá 5 hooks distintos para Reel/TikTok sobre "${topic}" del servicio "${service}". ${obj[objective]} Cada hook: máximo 2 oraciones, primera frase que detenga el scroll en menos de 3 segundos. Formato: numerados del 1 al 5, sin títulos ni explicaciones.`,

    caption: `Generá 4 captions para Instagram sobre "${topic}" del servicio "${service}". ${obj[objective]} Cada caption: 4-7 líneas, máximo 3 emojis estratégicamente ubicados, llamada a la acción al final, 5-7 hashtags relevantes. Formato: numerados, separados por línea en blanco.`,

    story: `Generá 6 frases para Stories de Instagram sobre "${topic}" del servicio "${service}". ${obj[objective]} Cada frase: máximo 8 palabras, debe funcionar sola sin contexto, impacto inmediato. Una por línea, sin numeración ni explicaciones.`,

    whatsapp: `Generá 3 mensajes de WhatsApp sobre "${service}" relacionado con "${topic}". ${obj[objective]} Cada mensaje: tono personal y cercano pero profesional, 3-5 oraciones, sin sonar a spam. Formato: numerados, separados por línea en blanco.`,

    guion: `Creá un guion completo para Reel de 30-45 segundos sobre "${topic}" del servicio "${service}". ${obj[objective]}

Usá esta estructura exacta:
🎬 HOOK (primeros 3 segundos — frase que paraliza el scroll)
🗣️ DESARROLLO (el cuerpo, con indicaciones visuales entre paréntesis)
💡 VALOR (el dato o transformación que demuestra expertise)
📢 CIERRE + CTA (llamada a la acción concreta)

Al final: 5 hashtags sugeridos.`,

    imagen: `Describí en inglés una imagen profesional para Instagram de una cosmetóloga experta sobre "${topic}" del servicio "${service}". ${obj[objective]}

Generá 3 opciones de prompt para crear la imagen con IA (Midjourney/DALL-E). Cada prompt debe:
- Describir la escena, iluminación, colores y estilo visual
- Ser específico para skin care / estética profesional
- Tener estética premium, limpia y confiable
- Incluir al final: "professional photography, soft pink tones, clean aesthetic, beauty clinic, high quality"

Formato: numerados del 1 al 3. Después de los prompts, agregá en español una sugerencia de texto para poner sobre la imagen.`
  };

  return `${tono}\n\n${types[type]}`;
}

// ─── DATOS UI ─────────────────────────────────────────────────────────────────
const OBJECTIVES = [
  { id:"viral",     label:"Viral",     icon:"🔥", color:"#e05a3a", colorBg:"rgba(224,90,58,0.15)",   colorBorder:"rgba(224,90,58,0.4)",   desc:"Máximo alcance y compartidas",     hint:"Datos que sorprenden, curiosidad, debate" },
  { id:"ventas",    label:"Ventas",    icon:"💸", color:"#c96a84", colorBg:"rgba(180,60,100,0.15)",  colorBorder:"rgba(180,60,100,0.4)",  desc:"Convierte seguidores en clientas", hint:"Valor del tratamiento + llamada a la acción" },
  { id:"educativo", label:"Educativo", icon:"🎓", color:"#7a9cc9", colorBg:"rgba(122,156,201,0.15)", colorBorder:"rgba(122,156,201,0.4)", desc:"Posicionarte como referente",       hint:"Evidencia, mitos, datos con base científica" },
];

const CONTENT_TYPES = [
  { id:"hook",     label:"Hook para Reel/TikTok", icon:"🎬", desc:"Primera frase que detiene el scroll" },
  { id:"caption",  label:"Caption para Foto",     icon:"📸", desc:"Texto profesional para Instagram" },
  { id:"story",    label:"Story / Frase Corta",   icon:"✨", desc:"Frase de impacto para Stories" },
  { id:"whatsapp", label:"Texto para WhatsApp",   icon:"💬", desc:"Mensaje que genera respuesta" },
  { id:"guion",    label:"Guion + Hook",          icon:"🎙️", desc:"Guion completo listo para grabar", featured:true },
  { id:"imagen",   label:"Prompt para Imagen IA", icon:"🖼️", desc:"Descripción para generar tu foto con IA", featured:true },
];

const SERVICES = ["Limpieza facial profunda","Peeling químico","Hidratación intensiva","Tratamiento anti-age","Microdermoabrasión","Lifting no quirúrgico","Tratamiento para acné","Radiofrecuencia facial","Depilación láser","Masajes relajantes","Otro (escribir abajo)"];
const TOPICS   = ["Resultados antes/después","Beneficios del tratamiento","Por qué elegirme a mí","Mitos y verdades","Proceso del tratamiento","Precio y valor","Testimonios de clientas","Cuidados post-tratamiento","Temporada / promotion","Otro (escribir abajo)"];
const STEPS    = ["Objetivo","Contenido","Servicio & Tema","Resultado"];

// ─── PAYWALL ──────────────────────────────────────────────────────────────────
function PaywallScreen() {
  return (
    <div style={{textAlign:"center",padding:"10px 0"}}>
      <LogoSVG size={68}/>
      <div style={{marginTop:14,marginBottom:8,fontSize:"10px",letterSpacing:"4px",textTransform:"uppercase",color:"#b05878",fontFamily:"sans-serif"}}>✦ Skin Content AI ✦</div>
      <h2 style={{fontSize:"22px",fontWeight:"400",margin:"0 0 10px",background:"linear-gradient(135deg,#f2c4d4,#b5607a)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>¡Agotaste tus usos gratuitos!</h2>
      <p style={{color:"#a06070",fontSize:"14px",fontFamily:"sans-serif",marginBottom:"22px",lineHeight:1.7}}>
        Usaste tus <strong style={{color:"#f2c4d4"}}>{FREE_LIMIT} generaciones gratis</strong>.<br/>Suscribite para seguir creando contenido ilimitado.
      </p>
      <div style={{background:"rgba(180,60,100,0.12)",border:"1px solid rgba(180,60,100,0.3)",borderRadius:"16px",padding:"18px",marginBottom:"18px"}}>
        <div style={{fontSize:"10px",letterSpacing:"3px",textTransform:"uppercase",color:"#c47090",fontFamily:"sans-serif",marginBottom:"6px"}}>Suscripción mensual</div>
        <div style={{fontSize:"34px",fontWeight:"300",color:"#f2c4d4",fontFamily:"Georgia,serif",marginBottom:"4px"}}>{PRECIO}</div>
        <div style={{fontSize:"12px",color:"#a06070",fontFamily:"sans-serif"}}>Cancelás cuando querés</div>
      </div>
      <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(180,60,100,0.15)",borderRadius:"14px",padding:"14px",marginBottom:"22px",textAlign:"left"}}>
        {[["🎬","Hooks virales para Reels y TikToks"],["📸","Captions profesionales para Instagram"],["✨","Frases de impacto para Stories"],["💬","Mensajes de WhatsApp que generan respuesta"],["🎙️","Guiones completos listos para grabar"],["🖼️","Prompts para generar imágenes con IA"],["🎯","3 objetivos: Viral, Ventas y Educativo"],["♾️","Generaciones ilimitadas"]].map(([ic,tx])=>(
          <div key={tx} style={{display:"flex",alignItems:"center",gap:"10px",padding:"6px 0",borderBottom:"1px solid rgba(180,60,100,0.08)",fontFamily:"sans-serif",fontSize:"13px",color:"#e0c0c8"}}>
            <span>{ic}</span>{tx}
          </div>
        ))}
      </div>
      <a href={MP_LINK} target="_blank" rel="noopener noreferrer"
        style={{display:"block",width:"100%",padding:"17px",background:"linear-gradient(135deg,#00b1ea,#009ee3)",borderRadius:"14px",color:"#fff",fontSize:"16px",fontFamily:"sans-serif",fontWeight:"600",textDecoration:"none",boxShadow:"0 8px 28px rgba(0,158,227,0.3)",marginBottom:"10px",boxSizing:"border-box",textAlign:"center"}}>
        💳  Suscribirme por {PRECIO}
      </a>
      <p style={{color:"#503040",fontSize:"11px",fontFamily:"sans-serif"}}>
        Pago seguro vía MercadoPago<br/>
        <span style={{color:"#7a4a5a"}}>by Natalia Martínez · Cosmetóloga &amp; Groq AI</span>
      </p>
    </div>
  );
}

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
  const
 
