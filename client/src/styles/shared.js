// ─── Design tokens ────────────────────────────────────────────────────────────
export const color = {
  bg:       'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
  surface:  'rgba(255,255,255,0.07)',
  border:   'rgba(255,255,255,0.12)',
  white:    '#ffffff',
  muted:    'rgba(255,255,255,0.45)',
  label:    'rgba(255,255,255,0.7)',
  accent:   '#818cf8',
  accentHover: '#a5b4fc',
  grad:     'linear-gradient(135deg, #6366f1, #8b5cf6)',

  // App (light) surface
  appBg:    '#f1f5f9',
  appCard:  '#ffffff',
  appBorder:'#e2e8f0',
  appText:  '#1e293b',
  appMuted: '#64748b',

  // Status
  greenBg:  'rgba(34,197,94,0.15)',   greenBorder: 'rgba(34,197,94,0.4)',   greenText: '#86efac',
  redBg:    'rgba(239,68,68,0.15)',   redBorder:   'rgba(239,68,68,0.4)',   redText:   '#fca5a5',
  blueBg:   'rgba(99,102,241,0.15)',  blueBorder:  'rgba(99,102,241,0.4)',  blueText:  '#a5b4fc',
  yellowBg: 'rgba(234,179,8,0.15)',   yellowBorder:'rgba(234,179,8,0.4)',   yellowText:'#fde047',
};

const font = "system-ui,-apple-system,'Segoe UI',sans-serif";

// ─── Auth page shell ───────────────────────────────────────────────────────────
export const authPage = {
  minHeight:'100vh', background:color.bg,
  display:'flex', alignItems:'center', justifyContent:'center',
  padding:'1.5rem', fontFamily:font,
};

export const authCard = {
  width:'100%', maxWidth:'440px',
  background:color.surface,
  border:`1px solid ${color.border}`,
  borderRadius:'16px', padding:'2.5rem 2rem',
  backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
};

export const brandTitle = {
  fontSize:'26px', fontWeight:700, color:color.white,
  margin:'0 0 4px', letterSpacing:'-0.5px',
};
export const brandSub = { fontSize:'14px', color:color.muted, margin:0 };

// ─── Auth form elements ────────────────────────────────────────────────────────
export const fieldGroup  = { marginBottom:'1.25rem' };
export const labelRow    = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' };
export const label       = { fontSize:'13px', fontWeight:500, color:color.label };
export const labelHint   = { fontSize:'12px', color:color.muted, fontWeight:400 };
export const forgotLink  = { fontSize:'12px', color:color.accent, textDecoration:'none' };

export const input = (focused) => ({
  width:'100%', padding:'11px 14px', boxSizing:'border-box',
  background: focused ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.08)',
  border: `1px solid ${focused ? '#6366f1' : 'rgba(255,255,255,0.15)'}`,
  borderRadius:'8px', color:color.white, fontSize:'14px',
  outline:'none', fontFamily:font,
  boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.2)' : 'none',
  transition:'border-color .2s, background .2s, box-shadow .2s',
});

export const textarea = (focused) => ({
  ...input(focused), resize:'vertical', lineHeight:1.6,
});

export const selectEl = (focused) => ({
  ...input(focused), cursor:'pointer',
});

export const submitBtn = (disabled) => ({
  width:'100%', padding:'12px', background:color.grad,
  border:'none', borderRadius:'8px', color:color.white,
  fontSize:'15px', fontWeight:600, cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily:font, letterSpacing:'0.01em',
  opacity: disabled ? 0.6 : 1, transition:'opacity .2s, transform .2s',
  marginTop:'0.25rem',
});

export const alertBox = (type) => {
  const map = {
    error:   { bg:color.redBg,    border:color.redBorder,    text:color.redText },
    success: { bg:color.greenBg,  border:color.greenBorder,  text:color.greenText },
    info:    { bg:color.blueBg,   border:color.blueBorder,   text:color.blueText },
  };
  const t = map[type] || map.error;
  return { padding:'10px 14px', background:t.bg, border:`1px solid ${t.border}`,
    borderRadius:'8px', color:t.text, fontSize:'13px', marginBottom:'1.25rem' };
};

export const linkStyle = { color:color.accent, textDecoration:'none', fontWeight:500 };
export const mutedText = { fontSize:'13px', color:color.muted, textAlign:'center', marginTop:'1.25rem' };

// ─── App (light) page shell ────────────────────────────────────────────────────
export const appPage = {
  minHeight:'100vh', background:color.appBg, fontFamily:font,
};

export const appHeader = {
  background:color.appCard, borderBottom:`1px solid ${color.appBorder}`,
  boxShadow:'0 1px 3px rgba(0,0,0,0.06)',
};

export const appHeaderInner = {
  maxWidth:'1200px', margin:'0 auto', padding:'0 1.5rem',
  height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between',
};

export const appMain = { maxWidth:'1200px', margin:'0 auto', padding:'2rem 1.5rem' };

export const appCard = {
  background:color.appCard, border:`1px solid ${color.appBorder}`,
  borderRadius:'12px', padding:'1.5rem',
  boxShadow:'0 1px 3px rgba(0,0,0,0.04)',
};

export const appTitle   = { fontSize:'22px', fontWeight:700, color:color.appText, margin:0 };
export const appSubtitle= { fontSize:'16px', fontWeight:600, color:color.appText, margin:0 };
export const appBody    = { fontSize:'14px', color:color.appMuted, lineHeight:1.6, margin:0 };

export const appInput = (focused) => ({
  width:'100%', padding:'9px 12px', boxSizing:'border-box',
  background:'#fff',
  border:`1.5px solid ${focused ? '#6366f1' : color.appBorder}`,
  borderRadius:'8px', color:color.appText, fontSize:'14px', outline:'none',
  fontFamily:font,
  boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
  transition:'border-color .2s, box-shadow .2s',
});

export const appTextarea = (focused) => ({ ...appInput(focused), resize:'vertical', lineHeight:1.6 });
export const appSelect   = (focused) => ({ ...appInput(focused), cursor:'pointer' });

export const appLabel = { fontSize:'13px', fontWeight:500, color:'#374151', display:'block', marginBottom:'5px' };

export const appBtn = (variant='primary') => {
  const base = {
    padding:'9px 20px', borderRadius:'8px', fontSize:'14px',
    fontWeight:600, cursor:'pointer', border:'none', fontFamily:font,
    transition:'opacity .15s, transform .15s',
  };
  if (variant === 'primary')   return { ...base, background:color.grad, color:'#fff' };
  if (variant === 'danger')    return { ...base, background:'#fee2e2', color:'#dc2626' };
  if (variant === 'ghost')     return { ...base, background:'transparent', color:'#6366f1', border:'1.5px solid #c7d2fe' };
  if (variant === 'secondary') return { ...base, background:'#f1f5f9', color:color.appText, border:`1px solid ${color.appBorder}` };
  return base;
};

// Status / priority badges
export const badge = (type) => {
  const base = { display:'inline-block', padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:600 };
  const map = {
    active:      { background:'#dcfce7', color:'#166534' },
    completed:   { background:'#dbeafe', color:'#1e40af' },
    archived:    { background:'#f1f5f9', color:'#475569' },
    todo:        { background:'#e0f2fe', color:'#0369a1' },
    'in-progress':{ background:'#fef9c3', color:'#854d0e' },
    high:        { background:'#fee2e2', color:'#dc2626' },
    medium:      { background:'#fef9c3', color:'#854d0e' },
    low:         { background:'#dcfce7', color:'#166534' },
  };
  return { ...base, ...(map[type] || { background:'#f1f5f9', color:'#475569' }) };
};

export const avatar = (size = 32) => ({
  width:size, height:size, borderRadius:'50%',
  background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
  color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
  fontSize: size > 36 ? '15px' : '13px', fontWeight:600, flexShrink:0,
});