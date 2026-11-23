/* ============================================================
   IA·K12 — Aula de IA
   Plataforma educativa para aprender Inteligencia Artificial (K-12).
   - Estudiante: explora módulos, realiza actividades con
     retroalimentación inmediata y ve su progreso. (CU-001)
   - Docente/Admin: panel de gestión de las 12 entidades + reglas
     de negocio (CU-002..005).
   Toda la lógica (progreso, completar, soft-delete) usa el API /api.
   ============================================================ */

const esc = (v) =>
  v == null ? '' : String(v).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fmtDate = (v) => {
  if (!v) return '<span class="cell-muted">—</span>';
  const d = new Date(v);
  if (isNaN(d)) return esc(v);
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: '2-digit' });
};

const pill = (text, variant = 'neutral') => `<span class="pill pill--${variant}">${esc(text)}</span>`;

/* ── Cliente API ───────────────────────────────────────────── */
async function api(method, path, body) {
  const res = await fetch('/api/' + path, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(getToken() ? { Authorization: 'Bearer ' + getToken() } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  if (text) { try { data = JSON.parse(text); } catch { data = text; } }
  if (!res.ok) {
    const msg =
      (data && (data.mensaje || data.error ||
        (data.detalles && data.detalles.map((d) => `${d.campo}: ${d.mensaje}`).join('; ')))) ||
      res.statusText;
    // RF-005 — sesión vencida o inválida: se vuelve a SCR-01 (no aplica al propio login)
    if (res.status === 401 && path !== 'auth/login' && getToken()) { clearIdentity(); navRole = null; setTimeout(router, 0); }
    const err = new Error(msg); err.status = res.status; throw err;
  }
  return data;
}

/* ── Sesión (RF-005): JWT emitido por POST /api/auth/login ──── */
const IDKEY = 'iak12_identity';
const getToken = () => { const i = getIdentity(); return i && i.token; };
const getIdentity = () => { try { return JSON.parse(localStorage.getItem(IDKEY)); } catch { return null; } };
const setIdentity = (id) => localStorage.setItem(IDKEY, JSON.stringify(id));
const clearIdentity = () => localStorage.removeItem(IDKEY);
// Rol del backend: 1 estudiante · 2 docente · 3 administrador
const roleOf = (idRol) => (idRol === 1 ? 'estudiante' : 'docente');

/* ── Banco de preguntas (frontend) ────────────────────────────
   El backend aún no modela PREGUNTA/OPCION_RESPUESTA (gap señalado
   por la docente), así que la comprobación vive en el cliente y su
   resultado alimenta la regla real `completar` del backend. ── */
const QUESTION_BANK = {
  fundamentos: [
    { q: '¿Qué es, en esencia, la Inteligencia Artificial?', o: ['Programas que imitan capacidades humanas como aprender o decidir', 'Un robot con forma humana', 'Una página web muy rápida'], a: 0 },
    { q: 'Cuando un sistema aprende a partir de ejemplos y datos, hablamos de…', o: ['Aprendizaje automático (Machine Learning)', 'Un protector de pantalla', 'Una hoja de cálculo'], a: 0 },
    { q: '¿Cuál es un ejemplo de IA en tu vida diaria?', o: ['Las recomendaciones de videos o música', 'Encender una linterna', 'Sumar con una calculadora de bolsillo'], a: 0 },
  ],
  etica: [
    { q: 'Un "sesgo" en un sistema de IA ocurre cuando…', o: ['Aprende de datos injustos y termina discriminando', 'Funciona demasiado rápido', 'Usa colores brillantes'], a: 0 },
    { q: '¿Por qué importa la privacidad al usar IA?', o: ['Porque usa datos personales que deben protegerse', 'Porque gasta batería', 'Porque ocupa espacio en disco'], a: 0 },
    { q: 'Si una IA comete un error grave, ¿quién es responsable?', o: ['Las personas que la diseñan y la usan', 'Nadie, es solo una máquina', 'El usuario que la apagó'], a: 0 },
  ],
  programacion: [
    { q: '¿Qué es un algoritmo?', o: ['Una secuencia de pasos para resolver un problema', 'Un tipo de pantalla', 'Un cable del computador'], a: 0 },
    { q: 'Un condicional (si… entonces…) sirve para…', o: ['Tomar decisiones según una condición', 'Apagar el equipo', 'Cambiar el fondo de pantalla'], a: 0 },
    { q: 'Para repetir una acción muchas veces usamos…', o: ['Un bucle o ciclo', 'Un borrador', 'Una impresora'], a: 0 },
  ],
  robotica: [
    { q: '¿Para qué sirve un sensor en un robot?', o: ['Para percibir el entorno (luz, distancia, temperatura)', 'Para pintar de colores', 'Para guardar archivos'], a: 0 },
    { q: '¿Qué hace un actuador?', o: ['Produce movimiento o acción, como un motor', 'Mide la temperatura', 'Conecta a internet'], a: 0 },
    { q: 'Un robot que esquiva obstáculos combina…', o: ['Sensores + lógica de decisión', 'Solo ruedas', 'Solo una batería'], a: 0 },
  ],
  general: [
    { q: '¿Qué puede hacer la Inteligencia Artificial?', o: ['Aprender de datos para realizar tareas', 'Sentir emociones reales', 'Vivir sin electricidad'], a: 0 },
    { q: '¿La IA "piensa" igual que un ser humano?', o: ['No: procesa datos siguiendo modelos y reglas', 'Sí, exactamente igual', 'Sí, pero más despacio'], a: 0 },
    { q: 'Una buena práctica al usar resultados de una IA es…', o: ['Revisarlos y cuestionarlos con criterio', 'Creerlos siempre sin dudar', 'Ignorarlos por completo'], a: 0 },
  ],
};
function pickBank(tipoContenido) {
  const t = (tipoContenido || '').toLowerCase();
  if (t.includes('ética') || t.includes('etica')) return QUESTION_BANK.etica;
  if (t.includes('program')) return QUESTION_BANK.programacion;
  if (t.includes('rob')) return QUESTION_BANK.robotica;
  if (t.includes('fundament')) return QUESTION_BANK.fundamentos;
  return QUESTION_BANK.general;
}

/* ── Notificaciones (SCR-13 · DE-01) ──────────────────────── */
async function notify(userId, tipo, mensaje) {
  if (!userId) return;
  try { await api('POST', 'notificaciones', { id_usuario: userId, tipo, mensaje }); } catch { /* no romper el flujo */ }
}
async function notifyAllStudents(tipo, mensaje) {
  try {
    const us = await api('GET', 'usuarios');
    await Promise.all(us.filter((u) => u.id_rol === 1).map((u) => notify(u.id_usuario, tipo, mensaje)));
  } catch { /* ignore */ }
}
async function refreshNotifBadge() {
  const id = getIdentity();
  const badge = document.getElementById('notif-badge');
  if (!badge || !id || id.role !== 'estudiante') return;
  try {
    const n = await api('GET', 'notificaciones');
    const unread = n.filter((x) => x.id_usuario === id.userId && !x.leida).length;
    badge.textContent = unread || '';
    badge.classList.toggle('is-on', unread > 0);
  } catch { /* ignore */ }
}

/* ─────────────────────────────────────────────────────────────
   PARTE A — APP DEL ESTUDIANTE
   ───────────────────────────────────────────────────────────── */

async function renderExplorar() {
  const id = getIdentity();
  const main = document.getElementById('main');
  main.innerHTML = `<div class="learn"><div class="loading">cargando módulos…</div></div>`;
  try {
    const [modulos, actividades, progresos, tipos, historiales, niveles] = await Promise.all([
      api('GET', 'modulos'), api('GET', 'actividades'),
      api('GET', 'progresos'), api('GET', 'tipos-contenido'), api('GET', 'historiales'), api('GET', 'niveles-educativos'),
    ]);
    const tcById = new Map(tipos.map((t) => [t.id_tipo_contenido, t.nombre_tipo]));
    const actById = new Map(actividades.map((a) => [a.id_actividad, a]));
    const míos = progresos.filter((p) => p.id_estudiante === id.userId);
    const completados = míos.filter((p) => p.estado === 'completado');
    const misHist = historiales.filter((h) => h.id_estudiante === id.userId);
    const puntos = completados.reduce((s, p) => s + Number(p.puntaje_obtenido || 0), 0);
    const actByMod = (mid) => actividades.filter((a) => a.id_modulo === mid);
    const activos = modulos.filter((m) => m.activo);
    const gami = computeGamification(completados, actById, misHist, activos);
    const heroName = esc(id.name.split(' ')[0] || id.name);

    const cardFor = (m, i) => {
      const acts = actByMod(m.id_modulo);
      const doneN = acts.filter((a) => completados.some((p) => p.id_actividad === a.id_actividad)).length;
      const pct = acts.length ? Math.round((doneN / acts.length) * 100) : 0;
      const tema = tcById.get(m.id_tipo_contenido) || 'IA';
      return `<button class="modcard" data-mod="${m.id_modulo}">
        <span class="modcard__idx">${String(i + 1).padStart(2, '0')}</span>
        <span class="modcard__body">
          <span class="modcard__tema">${esc(tema)}</span>
          <span class="modcard__title">${esc(m.titulo)}</span>
          <span class="modcard__desc">${esc((m.descripcion || '').slice(0, 110))}${(m.descripcion || '').length > 110 ? '…' : ''}</span>
          <span class="modcard__foot">
            <span class="bar"><span class="bar__fill" style="width:${pct}%"></span></span>
            <span class="modcard__meta">${doneN}/${acts.length} actividades${pct === 100 && acts.length ? ' · ✓ completo' : ''}</span>
          </span>
        </span>
      </button>`;
    };
    const applyFilter = () => {
      const q = (main.querySelector('#f-q').value || '').toLowerCase().trim();
      const niv = main.querySelector('#f-niv').value, tc = main.querySelector('#f-tc').value;
      const filtered = activos.filter((m) =>
        (!q || m.titulo.toLowerCase().includes(q) || (m.descripcion || '').toLowerCase().includes(q)) &&
        (!niv || String(m.id_nivel) === niv) && (!tc || String(m.id_tipo_contenido) === tc));
      const grid = main.querySelector('#modgrid');
      grid.innerHTML = !activos.length
        ? `<div class="empty"><strong>Aún no hay módulos publicados</strong>Pídele a tu docente que cree módulos desde el panel.</div>`
        : filtered.length ? filtered.map((m, i) => cardFor(m, i)).join('')
          : `<div class="empty"><strong>Sin resultados</strong>Prueba con otra búsqueda o quita los filtros.</div>`;
      grid.querySelectorAll('[data-mod]').forEach((el) => (el.onclick = () => { location.hash = `#/modulo/${el.dataset.mod}`; }));
    };

    main.innerHTML = `
      <div class="learn">
        <header class="hero">
          <p class="hero__kicker">Aula de Inteligencia Artificial · K-12</p>
          <h1 class="hero__title">Hola, ${heroName}.<br>Aprendamos algo de <em>IA</em> hoy.</h1>
          <p class="hero__sub">Explora un módulo, realiza sus actividades y recibe retroalimentación al instante. Tu avance se guarda automáticamente.</p>
          <div class="hero__stats">
            <span class="hstat"><b>${completados.length}</b> actividades completadas</span>
            <span class="hstat"><b>${puntos}</b> puntos acumulados</span>
            <span class="hstat"><b>${activos.length}</b> módulos disponibles</span>
          </div>
        </header>
        <div class="gami">
          <div class="gami__level">
            <div class="gami__lvrow"><span class="gami__lv">${esc(gami.level)}</span><span class="gami__xp">${gami.xp} XP</span></div>
            <div class="bar"><span class="bar__fill" style="width:${gami.pctNext}%"></span></div>
            <span class="gami__next">${gami.next ? `${gami.next.min - gami.xp} XP para ${esc(gami.next.name)}` : '¡Nivel máximo alcanzado!'}</span>
          </div>
          <div class="gami__badges">
            ${gami.badges.map((b) => `<span class="badge ${b.earned ? 'badge--on' : ''}" title="${esc(b.name)} — ${esc(b.desc)}">${b.icon}</span>`).join('')}
          </div>
        </div>
        <h2 class="learn__h">Módulos</h2>
        <div class="filterbar">
          <input class="input" id="f-q" placeholder="Buscar módulo…">
          <select class="select" id="f-niv"><option value="">Todos los niveles</option>${niveles.map((n) => `<option value="${n.id_nivel}">${esc(n.nombre_nivel)} (${esc(n.rango_grado)})</option>`).join('')}</select>
          <select class="select" id="f-tc"><option value="">Todos los temas</option>${tipos.map((t) => `<option value="${t.id_tipo_contenido}">${esc(t.nombre_tipo)}</option>`).join('')}</select>
        </div>
        <div class="modgrid" id="modgrid"></div>
      </div>`;

    ['#f-q', '#f-niv', '#f-tc'].forEach((sel) => { const el = main.querySelector(sel); el.oninput = applyFilter; el.onchange = applyFilter; });
    applyFilter();
  } catch (err) {
    main.innerHTML = `<div class="learn"><div class="empty"><strong>No se pudo cargar</strong>${esc(err.message)}</div></div>`;
  }
}

async function renderModulo(modId) {
  const id = getIdentity();
  const main = document.getElementById('main');
  main.innerHTML = `<div class="learn"><div class="loading">cargando módulo…</div></div>`;
  try {
    const [mod, actividades, progresos, tipos, tiposAct] = await Promise.all([
      api('GET', `modulos/${modId}`), api('GET', 'actividades'),
      api('GET', 'progresos'), api('GET', 'tipos-contenido'), api('GET', 'tipos-actividad'),
    ]);
    const tema = (tipos.find((t) => t.id_tipo_contenido === mod.id_tipo_contenido) || {}).nombre_tipo || 'IA';
    const taById = new Map(tiposAct.map((t) => [t.id_tipo_actividad, t.nombre_tipo]));
    const acts = actividades.filter((a) => a.id_modulo === Number(modId));
    const míos = progresos.filter((p) => p.id_estudiante === id.userId);
    const progOf = (aid) => míos.find((p) => p.id_actividad === aid);

    const rows = acts.length ? acts.map((a, i) => {
      const p = progOf(a.id_actividad);
      const estado = p ? p.estado : 'sin_empezar';
      const badge = estado === 'completado'
        ? pill(`✓ ${p.puntaje_obtenido}/${a.puntaje_maximo}`, 'ok')
        : estado === 'en_progreso' ? pill('en progreso', 'warn') : pill('por empezar', 'neutral');
      return `<button class="actrow" data-act="${a.id_actividad}">
        <span class="actrow__n">${i + 1}</span>
        <span class="actrow__body">
          <span class="actrow__title">${esc(a.titulo)}</span>
          <span class="actrow__meta">${esc(taById.get(a.id_tipo_actividad) || 'Actividad')} · ${a.puntaje_maximo} pts</span>
        </span>
        ${badge}
        <span class="actrow__go">${estado === 'completado' ? 'Repasar' : 'Empezar'} →</span>
      </button>`;
    }).join('') : `<div class="empty"><strong>Este módulo aún no tiene actividades</strong>Vuelve pronto.</div>`;

    main.innerHTML = `
      <div class="learn learn--narrow">
        <a class="back" href="#/explorar">← Volver a módulos</a>
        <header class="mhead">
          <p class="hero__kicker">${esc(tema)}</p>
          <h1 class="mhead__title">${esc(mod.titulo)}</h1>
          <p class="mhead__desc">${esc(mod.descripcion)}</p>
        </header>
        <h2 class="learn__h">Actividades</h2>
        <div class="actlist">${rows}</div>
      </div>`;
    main.querySelectorAll('[data-act]').forEach((el) =>
      el.onclick = () => { location.hash = `#/actividad/${el.dataset.act}`; });
  } catch (err) {
    main.innerHTML = `<div class="learn"><div class="empty"><strong>No se pudo cargar el módulo</strong>${esc(err.message)}</div></div>`;
  }
}

async function renderActividad(actId) {
  const id = getIdentity();
  const main = document.getElementById('main');
  main.innerHTML = `<div class="learn"><div class="loading">cargando actividad…</div></div>`;
  try {
    const act = await api('GET', `actividades/${actId}`);
    const [mod, tipos, progresos] = await Promise.all([
      api('GET', `modulos/${act.id_modulo}`), api('GET', 'tipos-contenido'), api('GET', 'progresos'),
    ]);
    const tema = (tipos.find((t) => t.id_tipo_contenido === mod.id_tipo_contenido) || {}).nombre_tipo || 'IA';
    // Preguntas reales del backend (E8-PREGUNTA / OPCION_RESPUESTA). Si la actividad
    // aún no tiene preguntas cargadas, cae al banco local (compatibilidad).
    const preguntasBE = await api('GET', `actividades/${actId}/preguntas`);
    const questions = preguntasBE.length
      ? preguntasBE.map((p) => ({ q: p.enunciado, intentos: p.max_intentos || 3, id: p.id_pregunta, retro: p.retroalimentacion, opts: (p.opciones || []).map((o) => ({ id: o.id_opcion, texto: o.texto, correcta: o.es_correcta })) }))
      : pickBank(tema).map((b) => ({ q: b.q, intentos: 3, retro: null, opts: b.o.map((t, i) => ({ texto: t, correcta: i === b.a })) }));
    let prog = progresos.find((p) => p.id_estudiante === id.userId && p.id_actividad === Number(actId));
    const yaHecho = prog && prog.estado === 'completado';

    const content = `
      <a class="back" href="#/modulo/${act.id_modulo}">← ${esc(mod.titulo)}</a>
      <header class="mhead">
        <p class="hero__kicker">${esc(tema)} · ${act.puntaje_maximo} puntos</p>
        <h1 class="mhead__title">${esc(act.titulo)}</h1>
      </header>
      <div class="reading">
        <p>${esc(act.descripcion)}</p>
        <div class="callout">
          <span class="callout__l">Instrucciones</span>
          <p>${esc(act.instrucciones)}</p>
        </div>
      </div>`;

    if (yaHecho) {
      main.innerHTML = `<div class="learn learn--narrow">${content}
        <div class="result result--done">
          <div class="result__score">${prog.puntaje_obtenido}<span>/${act.puntaje_maximo}</span></div>
          <div>
            <strong>Actividad completada</strong>
            <p>Ya superaste esta actividad. Puedes repasar el contenido cuando quieras.</p>
          </div>
        </div>
        <div class="learn__actions">
          <a class="btn" href="#/modulo/${act.id_modulo}">Volver al módulo</a>
          <a class="btn btn--primary" href="#/progreso">Ver mi progreso</a>
        </div>
      </div>`;
      return;
    }

    // CU-001 A2 — comprobación interactiva con reintentos por pregunta (max_intentos).
    const quiz = questions.map((item, qi) => `
      <div class="q" data-q="${qi}">
        <div class="q__head"><span class="q__txt">${qi + 1}. ${esc(item.q)}</span><span class="q__tries" data-tries="${qi}">${item.intentos} intento${item.intentos === 1 ? '' : 's'}</span></div>
        <div class="q__opts">
          ${item.opts.map((opt, oi) => `<button type="button" class="qopt" data-q="${qi}" data-o="${oi}">${esc(opt.texto)}</button>`).join('')}
        </div>
        <div class="q__fb" data-fb="${qi}"></div>
      </div>`).join('');

    main.innerHTML = `<div class="learn learn--narrow">${content}
      <h2 class="learn__h">Comprobación</h2>
      <p class="learn__hint">Elige una opción en cada pregunta. Si fallas, puedes reintentar (CU-001 A2). Tu puntaje es sobre ${act.puntaje_maximo}.</p>
      <div id="quiz">${quiz}</div>
      <div class="learn__actions">
        <a class="btn" href="#/modulo/${act.id_modulo}">Cancelar</a>
        <button class="btn btn--primary" id="finish" disabled>Finalizar actividad</button>
      </div>
    </div>`;

    const state = questions.map((qq) => ({ left: qq.intentos, done: false, correct: false, chosen: null }));
    const refreshFinish = () => { document.getElementById('finish').disabled = !state.every((s) => s.done); };

    main.querySelectorAll('.qopt').forEach((btn) => {
      btn.onclick = () => {
        const qi = Number(btn.dataset.q), oi = Number(btn.dataset.o);
        const st = state[qi];
        if (st.done) return;
        const opt = questions[qi].opts[oi];
        st.chosen = opt.id;
        const fb = main.querySelector(`[data-fb="${qi}"]`);
        const tries = main.querySelector(`[data-tries="${qi}"]`);
        const allOpts = main.querySelectorAll(`.qopt[data-q="${qi}"]`);
        if (opt.correcta) {
          st.done = true; st.correct = true;
          btn.classList.add('qopt--ok');
          allOpts.forEach((b) => (b.disabled = true));
          fb.className = 'q__fb q__fb--ok';
          fb.textContent = '✓ ¡Correcto!' + (questions[qi].retro ? ` ${questions[qi].retro}` : '');
          tries.textContent = 'resuelta';
        } else {
          st.left -= 1;
          btn.classList.add('qopt--bad'); btn.disabled = true;
          if (st.left <= 0) {
            st.done = true; st.correct = false;
            allOpts.forEach((b) => { b.disabled = true; if (questions[qi].opts[Number(b.dataset.o)].correcta) b.classList.add('qopt--reveal'); });
            fb.className = 'q__fb q__fb--bad';
            fb.textContent = '✗ Sin intentos. Dejamos marcada la respuesta correcta.';
            tries.textContent = 'sin intentos';
          } else {
            fb.className = 'q__fb q__fb--warn';
            fb.textContent = `Casi… intenta de nuevo. Te ${st.left === 1 ? 'queda' : 'quedan'} ${st.left} intento${st.left === 1 ? '' : 's'}.`;
            tries.textContent = `${st.left} intento${st.left === 1 ? '' : 's'}`;
          }
        }
        refreshFinish();
      };
    });

    document.getElementById('finish').onclick = async () => {
      const correct = state.filter((s) => s.correct).length;
      const total = questions.length;
      const marks = state.map((s) => s.correct);
      const score = Math.round((correct / total) * act.puntaje_maximo);
      const fbtn = document.getElementById('finish');
      fbtn.disabled = true; fbtn.textContent = 'Guardando…';
      try {
        if (!prog) prog = await api('POST', 'progresos', { id_estudiante: id.userId, id_actividad: Number(actId) });
        let finalScore;
        if (questions[0].id) {
          // RF-016/RF-018 — la evaluación la calcula el servidor (es_correcta); el cliente solo envía lo elegido
          const r = await api('POST', `progresos/${prog.id_progreso}/responder`, { respuestas: questions.map((qq, i) => ({ id_pregunta: qq.id, id_opcion: state[i].chosen })) });
          finalScore = r.puntaje;
        } else {
          const updated = await api('POST', `progresos/${prog.id_progreso}/completar`, { puntaje: score });
          finalScore = updated.puntaje_obtenido;
        }
        const modInfo = await maybeCompleteModule(id.userId, act.id_modulo);  // RF-018
        showActivityResult(act, mod, questions, marks, correct, total, finalScore, modInfo);
      } catch (err) {
        if (err.status === 409) { toast('Esta actividad ya estaba completada', 'info', '409'); renderActividad(actId); }
        else { toast(err.message, 'bad', err.status); fbtn.disabled = false; fbtn.textContent = 'Finalizar actividad'; }
      }
    };
  } catch (err) {
    main.innerHTML = `<div class="learn"><div class="empty"><strong>No se pudo cargar la actividad</strong>${esc(err.message)}</div></div>`;
  }
}

// RF-018 — al completar TODAS las actividades de un módulo, registra el HISTORIAL_PRACTICA.
async function maybeCompleteModule(studentId, moduleId) {
  try {
    const [acts, progresos, historiales] = await Promise.all([
      api('GET', 'actividades'), api('GET', 'progresos'), api('GET', 'historiales'),
    ]);
    const modActs = acts.filter((a) => a.id_modulo === Number(moduleId));
    const mine = progresos.filter((p) => p.id_estudiante === studentId);
    const done = modActs.filter((a) => mine.some((p) => p.id_actividad === a.id_actividad && p.estado === 'completado'));
    if (!modActs.length || done.length < modActs.length) return { justCompleted: false };
    if (historiales.some((h) => h.id_estudiante === studentId && h.id_modulo === Number(moduleId))) return { justCompleted: false, already: true };
    const total = done.reduce((s, a) => s + Number((mine.find((p) => p.id_actividad === a.id_actividad) || {}).puntaje_obtenido || 0), 0);
    const maxTotal = modActs.reduce((s, a) => s + Number(a.puntaje_maximo || 0), 0);
    const aprobado = maxTotal > 0 && total / maxTotal >= 0.6;
    const fechas = done.map((a) => new Date((mine.find((p) => p.id_actividad === a.id_actividad) || {}).fecha_realizacion)).filter((d) => !isNaN(d));
    const inicio = fechas.length ? new Date(Math.min(...fechas)) : new Date();
    await api('POST', 'historiales', {
      id_estudiante: studentId, id_modulo: Number(moduleId),
      fecha_inicio: inicio.toISOString(), fecha_fin: new Date().toISOString(),
      puntaje_total: total, actividades_completadas: done.length, modulo_aprobado: aprobado,
    });
    const mod = await api('GET', `modulos/${moduleId}`).catch(() => ({}));
    await notify(studentId, 'modulo_completado', `🎉 ¡Completaste el módulo "${mod.titulo || ''}"! ${aprobado ? 'Lo aprobaste.' : ''}`);
    return { justCompleted: true, aprobado, total, maxTotal };
  } catch { return { justCompleted: false }; }
}

function showActivityResult(act, mod, questions, marks, correct, total, score, modInfo) {
  const main = document.getElementById('main');
  const pct = Math.round((correct / total) * 100);
  const tone = pct >= 70 ? 'ok' : pct >= 40 ? 'warn' : 'bad';
  const review = questions.map((item, i) => `
    <div class="rev rev--${marks[i] ? 'ok' : 'bad'}">
      <span class="rev__ico">${marks[i] ? '✓' : '✗'}</span>
      <div><div class="rev__q">${esc(item.q)}</div>
      <div class="rev__a">Respuesta correcta: ${esc((item.opts.find((o) => o.correcta) || {}).texto || '')}</div></div>
    </div>`).join('');
  const banner = modInfo && modInfo.justCompleted
    ? `<div class="banner banner--celebrate"><span class="banner__ico">🎉</span><div><strong>¡Módulo completado!</strong><p>Se registró en tu Historial de práctica${modInfo.aprobado ? ' y lo aprobaste' : ''} (${modInfo.total}/${modInfo.maxTotal} pts).</p></div></div>`
    : '';
  main.innerHTML = `<div class="learn learn--narrow">
    <header class="mhead"><p class="hero__kicker">${esc(act.titulo)}</p>
      <h1 class="mhead__title">¡Listo!</h1></header>
    ${banner}
    <div class="result result--${tone}">
      <div class="result__score">${score}<span>/${act.puntaje_maximo}</span></div>
      <div><strong>${correct} de ${total} correctas (${pct}%)</strong>
        <p>${pct >= 70 ? '¡Buen trabajo! Dominaste los conceptos clave.' : pct >= 40 ? 'Vas bien. Repasa el contenido y sigue practicando.' : 'No te rindas: vuelve a leer el módulo y vuelve a intentarlo en otra actividad.'}</p></div>
    </div>
    <div class="callout"><span class="callout__l">Qué se evaluó</span><p>${esc(act.criterio_evaluacion)}</p></div>
    <h2 class="learn__h">Retroalimentación</h2>
    <div class="revlist">${review}</div>
    <div class="learn__actions">
      <a class="btn" href="#/modulo/${act.id_modulo}">Volver al módulo</a>
      <a class="btn btn--primary" href="#/progreso">Ver mi progreso</a>
    </div>
  </div>`;
  toast('Progreso guardado', 'ok', '200');
}

// Gamificación — derivada del progreso real (sin cambios de esquema).
function computeGamification(mineCompleted, actById, historiales, modulos) {
  const xp = mineCompleted.reduce((s, p) => s + Number(p.puntaje_obtenido || 0), 0);
  const LEVELS = [{ min: 0, name: 'Explorador' }, { min: 20, name: 'Aprendiz' }, { min: 50, name: 'Practicante' }, { min: 100, name: 'Experto' }, { min: 200, name: 'Maestro IA' }];
  let level = LEVELS[0];
  LEVELS.forEach((L) => { if (xp >= L.min) level = L; });
  const next = LEVELS.find((L) => L.min > xp) || null;
  const pctNext = next ? Math.round(((xp - level.min) / (next.min - level.min)) * 100) : 100;
  const perfect = mineCompleted.some((p) => { const a = actById.get(p.id_actividad); return a && Number(p.puntaje_obtenido) === Number(a.puntaje_maximo); });
  const badges = [
    { icon: '🚀', name: 'Primer paso', desc: 'Completaste tu primera actividad', earned: mineCompleted.length >= 1 },
    { icon: '🔥', name: 'En racha', desc: 'Completaste 3 actividades', earned: mineCompleted.length >= 3 },
    { icon: '🎯', name: 'Puntaje perfecto', desc: 'Lograste 100% en una actividad', earned: perfect },
    { icon: '📘', name: 'Módulo dominado', desc: 'Completaste un módulo entero', earned: historiales.length >= 1 },
    { icon: '🏆', name: 'Maestro IA', desc: 'Completaste todos los módulos', earned: modulos.length > 0 && historiales.length >= modulos.length },
  ];
  return { xp, level: level.name, next, pctNext, badges };
}

async function renderMiProgreso() {
  const id = getIdentity();
  const main = document.getElementById('main');
  main.innerHTML = `<div class="learn"><div class="loading">cargando progreso…</div></div>`;
  try {
    const [progresos, actividades, modulos, historiales] = await Promise.all([
      api('GET', 'progresos'), api('GET', 'actividades'), api('GET', 'modulos'), api('GET', 'historiales'),
    ]);
    const actById = new Map(actividades.map((a) => [a.id_actividad, a]));
    const modById = new Map(modulos.map((m) => [m.id_modulo, m]));
    const míos = progresos.filter((p) => p.id_estudiante === id.userId);
    const comp = míos.filter((p) => p.estado === 'completado');
    const misHist = historiales.filter((h) => h.id_estudiante === id.userId);
    const puntos = comp.reduce((s, p) => s + Number(p.puntaje_obtenido || 0), 0);
    const maxPos = comp.reduce((s, p) => s + Number((actById.get(p.id_actividad) || {}).puntaje_maximo || 0), 0);
    const prom = maxPos ? Math.round((puntos / maxPos) * 100) : 0;
    const gami = computeGamification(comp, actById, misHist, modulos.filter((m) => m.activo));

    const rows = míos.length ? míos.map((p) => {
      const a = actById.get(p.id_actividad) || {};
      const m = modById.get(a.id_modulo) || {};
      const done = p.estado === 'completado';
      return `<tr>
        <td><strong>${esc(a.titulo || 'Actividad')}</strong><div class="cell-sub">${esc(m.titulo || '')}</div></td>
        <td>${done ? pill('completada', 'ok') : pill('en progreso', 'warn')}</td>
        <td class="col-num">${done ? `${p.puntaje_obtenido}/${a.puntaje_maximo || '?'}` : '—'}</td>
        <td class="cell-muted">${fmtDate(p.fecha_realizacion)}</td>
        <td>${a.id_actividad ? `<a class="btn btn--ghost btn--sm" href="#/actividad/${a.id_actividad}">${done ? 'Repasar' : 'Continuar'}</a>` : ''}</td>
      </tr>`;
    }).join('') : '';

    main.innerHTML = `<div class="learn">
      <header class="mhead"><p class="hero__kicker">Tu avance</p>
        <h1 class="mhead__title">Mi progreso</h1></header>
      <div class="prog-stats">
        <div class="pstat"><div class="pstat__n">${comp.length}</div><div class="pstat__l">Actividades completadas</div></div>
        <div class="pstat"><div class="pstat__n">${puntos}</div><div class="pstat__l">Puntos ganados</div></div>
        <div class="pstat"><div class="pstat__n">${prom}%</div><div class="pstat__l">Promedio de dominio</div></div>
        <div class="pstat"><div class="pstat__n">${misHist.length}</div><div class="pstat__l">Módulos completados</div></div>
      </div>

      <h2 class="learn__h">Nivel · ${esc(gami.level)} <span class="gami__xp" style="font-family:var(--font-mono);font-size:13px">${gami.xp} XP</span></h2>
      <div class="bar" style="max-width:420px;margin-bottom:6px"><span class="bar__fill" style="width:${gami.pctNext}%"></span></div>
      <p class="learn__hint">${gami.next ? `${gami.next.min - gami.xp} XP para alcanzar “${esc(gami.next.name)}”.` : '¡Llegaste al nivel máximo, Maestro IA!'}</p>
      <div class="badgewall">
        ${gami.badges.map((b) => `<div class="badgecard ${b.earned ? 'badgecard--on' : ''}"><span class="badgecard__ico">${b.icon}</span><div><strong>${esc(b.name)}</strong><small>${esc(b.desc)}</small></div>${b.earned ? '<span class="badgecard__chk">✓</span>' : ''}</div>`).join('')}
      </div>

      <h2 class="learn__h">Actividades</h2>
      ${míos.length
        ? `<div class="tablewrap"><div class="tbl-scroll"><table>
            <thead><tr><th>Actividad</th><th>Estado</th><th>Puntaje</th><th>Fecha</th><th></th></tr></thead>
            <tbody>${rows}</tbody></table></div></div>`
        : `<div class="empty"><strong>Todavía no has hecho actividades</strong>Ve a <a href="#/explorar" style="color:var(--accent-ink)">Explorar</a> y empieza tu primer módulo.</div>`}
    </div>`;
  } catch (err) {
    main.innerHTML = `<div class="learn"><div class="empty"><strong>No se pudo cargar</strong>${esc(err.message)}</div></div>`;
  }
}

/* ── SCR-13 — Notificaciones del estudiante ───────────────── */
async function renderNotificaciones() {
  const id = getIdentity();
  const main = document.getElementById('main');
  main.innerHTML = `<div class="learn"><div class="loading">cargando notificaciones…</div></div>`;
  try {
    const all = await api('GET', 'notificaciones');
    const mine = all.filter((n) => n.id_usuario === id.userId).sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
    const unread = mine.filter((n) => !n.leida);
    const list = mine.length ? mine.map((n) => `
      <div class="notif ${n.leida ? '' : 'notif--unread'}" data-nid="${n.id_notificacion}">
        <span class="notif__dot"></span>
        <div class="notif__body"><p>${esc(n.mensaje)}</p><span class="notif__time">${fmtDate(n.fecha_creacion)} · ${esc(n.tipo)}</span></div>
        ${n.leida ? '' : '<button class="btn btn--ghost btn--sm" data-read>Marcar leída</button>'}
      </div>`).join('') : `<div class="empty"><strong>Sin notificaciones</strong>Cuando tu docente asigne actividades o completes módulos, aparecerán aquí.</div>`;
    main.innerHTML = `<div class="learn learn--narrow">
      <div class="view__head" style="border:0;padding:0;margin-bottom:18px">
        <div><div class="hero__kicker">SCR-13 · Avisos</div><h1 class="mhead__title">Notificaciones</h1></div>
        ${unread.length ? `<button class="btn" id="read-all">Marcar todas (${unread.length})</button>` : ''}
      </div>
      <div class="notiflist">${list}</div>
    </div>`;
    main.querySelectorAll('[data-read]').forEach((b) => {
      b.onclick = async () => { await api('PUT', `notificaciones/${b.closest('[data-nid]').dataset.nid}`, { leida: true }); renderNotificaciones(); refreshNotifBadge(); };
    });
    const ra = main.querySelector('#read-all');
    if (ra) ra.onclick = async () => { await Promise.all(unread.map((n) => api('PUT', `notificaciones/${n.id_notificacion}`, { leida: true }))); renderNotificaciones(); refreshNotifBadge(); };
  } catch (err) { main.innerHTML = `<div class="learn"><div class="empty"><strong>Error</strong>${esc(err.message)}</div></div>`; }
}

/* ── SCR-01 Inicio de sesión (RF-005 · RNF-005) · SCR-02 Registro ─────── */
async function renderGate(modo = 'login') {
  const main = document.getElementById('main');
  document.querySelector('.shell').classList.add('no-id');
  const head = `<div class="gate__brand"><span class="brand__mark">IA</span> <strong>IA·K12 — Aula de IA</strong></div>`;

  if (modo === 'registro') {
    let niveles = [];
    try { niveles = await api('GET', 'niveles-educativos'); } catch { /* sin nivel */ }
    main.innerHTML = `<div class="gate" style="max-width:480px">${head}
      <h1 class="gate__title" style="font-size:32px">Crear cuenta de estudiante</h1>
      <section class="gate__card"><form id="reg" class="gate__form">
        <input class="input" name="nombre" placeholder="Nombre" required>
        <input class="input" name="apellido" placeholder="Apellido" required>
        <input class="input" type="email" name="correo" placeholder="Correo" autocomplete="username" required>
        <input class="input" type="password" name="contrasena" placeholder="Contraseña (mín. 8 caracteres)" minlength="8" autocomplete="new-password" required>
        <select class="select" name="id_nivel"><option value="">Nivel (opcional)</option>${niveles.map((n) => `<option value="${n.id_nivel}">${esc(n.nombre_nivel)} (${esc(n.rango_grado)})</option>`).join('')}</select>
        <button class="btn btn--primary" type="submit">Registrarme</button>
      </form><p class="gate__hint"><a href="#" id="to-login">← Ya tengo cuenta</a></p></section></div>`;
    main.querySelector('#to-login').onclick = (e) => { e.preventDefault(); renderGate('login'); };
    main.querySelector('#reg').onsubmit = async (e) => {
      e.preventDefault();
      const f = e.target;
      const payload = { nombre: f.nombre.value.trim(), apellido: f.apellido.value.trim(), correo: f.correo.value.trim(), contrasena: f.contrasena.value };
      if (f.id_nivel.value) payload.id_nivel = Number(f.id_nivel.value);
      try {
        await api('POST', 'usuarios', payload);               // el servidor fuerza rol estudiante
        await iniciarSesion(payload.correo, payload.contrasena);
      } catch (err) { toast(err.message, 'bad', err.status); }
    };
    return;
  }

  main.innerHTML = `<div class="gate" style="max-width:480px">${head}
    <h1 class="gate__title" style="font-size:32px">Iniciar sesión</h1>
    <section class="gate__card">
      <form id="login" class="gate__form" novalidate>
        <input class="input" type="email" name="correo" placeholder="Correo" autocomplete="username" required>
        <input class="input" type="password" name="contrasena" placeholder="Contraseña" autocomplete="current-password" required>
        <div id="login-msg" class="gate__hint" role="alert" aria-live="polite"></div>
        <button class="btn btn--primary" type="submit" id="login-btn">Entrar</button>
      </form>
      <p class="gate__hint"><a href="#" id="to-rec">Recuperar contraseña</a> · <a href="#" id="to-reg">Registrarse</a></p>
    </section>
    <p class="gate__foot mono">SCR-01 · RF-005 · 5 intentos fallidos bloquean la cuenta 15 min (RNF-005)</p></div>`;
  main.querySelector('#to-reg').onclick = (e) => { e.preventDefault(); renderGate('registro'); };
  main.querySelector('#to-rec').onclick = (e) => { e.preventDefault(); toast('Recuperar contraseña (SCR-03) aún no está implementado', 'info'); };
  main.querySelector('#login').onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target, msg = main.querySelector('#login-msg'), btn = main.querySelector('#login-btn');
    if (!f.correo.value.trim() || !f.contrasena.value) { msg.textContent = 'Escribe tu correo y contraseña.'; return; }
    btn.disabled = true; msg.textContent = '';
    try { await iniciarSesion(f.correo.value.trim(), f.contrasena.value); }
    catch (err) {
      msg.textContent = err.status === 423 ? 'Cuenta bloqueada por intentos fallidos. Intenta de nuevo en 15 minutos.' : err.message;
      if (err.status === 423) { f.querySelectorAll('input').forEach((i) => (i.disabled = true)); }
      else btn.disabled = false;
    }
  };
}
async function iniciarSesion(correo, contrasena) {
  const { token, usuario } = await api('POST', 'auth/login', { correo, contrasena });
  enter({ role: roleOf(usuario.id_rol), idRol: usuario.id_rol, userId: usuario.id_usuario, name: `${usuario.nombre} ${usuario.apellido}`, token });
}
function enter(identity) {
  setIdentity(identity);
  document.querySelector('.shell').classList.remove('no-id');
  navRole = null;
  location.hash = identity.role === 'estudiante' ? '#/explorar' : '#/panel';
  router();
}

/* ─────────────────────────────────────────────────────────────
   PARTE B — PANEL DOCENTE / ADMIN (CRUD de las 12 entidades)
   ───────────────────────────────────────────────────────────── */

const USER_ESTADO = { activo: 'ok', pendiente: 'warn', bloqueado_temporal: 'warn', inactivo: 'neutral', eliminado_logico: 'bad' };
const boolPill = (v, on = 'activo', off = 'inactivo') => (v ? pill(on, 'ok') : pill(off, 'neutral'));

const R = {
  roles: { pk: 'id_rol', singular: 'Rol', plural: 'Roles', group: 'Maestras', label: (r) => r.nombre_rol,
    columns: [{ h: 'ID', cls: 'col-id', c: (r) => r.id_rol }, { h: 'Rol', c: (r) => `<strong>${esc(r.nombre_rol)}</strong>` }, { h: 'Descripción', cls: 'cell-muted', c: (r) => esc(r.descripcion) }, { h: 'Estado', c: (r) => boolPill(r.activo) }],
    fields: [{ k: 'nombre_rol', label: 'Nombre del rol', type: 'select', required: true, options: ['Estudiante', 'Docente', 'Administrador', 'Coordinador', 'Directivo'] }, { k: 'descripcion', label: 'Descripción', type: 'textarea' }, { k: 'activo', label: 'Activo', type: 'bool', default: true }] },
  'niveles-educativos': { pk: 'id_nivel', singular: 'Nivel educativo', plural: 'Niveles educativos', group: 'Maestras', label: (r) => `${r.nombre_nivel} (${r.rango_grado})`,
    columns: [{ h: 'ID', cls: 'col-id', c: (r) => r.id_nivel }, { h: 'Código', cls: 'col-id', c: (r) => esc(r.codigo_nie) }, { h: 'Nivel', c: (r) => `<strong>${esc(r.nombre_nivel)}</strong>` }, { h: 'Rango', c: (r) => pill(r.rango_grado, 'accent') }],
    fields: [{ k: 'codigo_nie', label: 'Código', type: 'text', required: true, hint: 'p. ej. NIE-005' }, { k: 'nombre_nivel', label: 'Nombre del nivel', type: 'text', required: true }, { k: 'rango_grado', label: 'Rango de grado', type: 'text', required: true, hint: 'p. ej. K-2, 9-12' }] },
  'tipos-contenido': { pk: 'id_tipo_contenido', singular: 'Tipo de contenido', plural: 'Tipos de contenido', group: 'Maestras', label: (r) => r.nombre_tipo,
    columns: [{ h: 'ID', cls: 'col-id', c: (r) => r.id_tipo_contenido }, { h: 'Tipo', c: (r) => `<strong>${esc(r.nombre_tipo)}</strong>` }, { h: 'Descripción', cls: 'cell-muted', c: (r) => esc(r.descripcion) }],
    fields: [{ k: 'nombre_tipo', label: 'Nombre del tipo', type: 'text', required: true }, { k: 'descripcion', label: 'Descripción', type: 'textarea' }] },
  'tipos-actividad': { pk: 'id_tipo_actividad', singular: 'Tipo de actividad', plural: 'Tipos de actividad', group: 'Maestras', label: (r) => r.nombre_tipo,
    columns: [{ h: 'ID', cls: 'col-id', c: (r) => r.id_tipo_actividad }, { h: 'Tipo', c: (r) => `<strong>${esc(r.nombre_tipo)}</strong>` }, { h: 'Descripción', cls: 'cell-muted', c: (r) => esc(r.descripcion) }],
    fields: [{ k: 'nombre_tipo', label: 'Nombre del tipo', type: 'text', required: true }, { k: 'descripcion', label: 'Descripción', type: 'textarea' }] },
  instituciones: { pk: 'id_institucion', singular: 'Institución', plural: 'Instituciones', group: 'Maestras', label: (r) => r.nombre,
    columns: [{ h: 'ID', cls: 'col-id', c: (r) => r.id_institucion }, { h: 'Institución', c: (r) => `<strong>${esc(r.nombre)}</strong>` }, { h: 'Municipio', c: (r) => esc(r.municipio) }, { h: 'Tipo', c: (r) => (r.tipo ? pill(r.tipo, r.tipo === 'publica' ? 'accent' : 'neutral') : '') }],
    fields: [{ k: 'nombre', label: 'Nombre', type: 'text', required: true }, { k: 'municipio', label: 'Municipio', type: 'text', required: true }, { k: 'tipo', label: 'Tipo', type: 'select', options: ['publica', 'privada'] }, { k: 'niveles_educativos', label: 'Niveles que ofrece', type: 'text' }, { k: 'contacto', label: 'Contacto', type: 'text' }] },
  usuarios: { pk: 'id_usuario', singular: 'Usuario', plural: 'Usuarios', group: 'Transaccionales', label: (r) => `${r.nombre} ${r.apellido}`, deleteLabel: 'Desactivar',
    columns: [{ h: 'ID', cls: 'col-id', c: (r) => r.id_usuario }, { h: 'Nombre', c: (r) => `<strong>${esc(r.nombre)} ${esc(r.apellido)}</strong>` }, { h: 'Correo', cls: 'col-id', c: (r) => esc(r.correo) }, { h: 'Rol', c: (r) => refLabel('roles', r.id_rol) }, { h: 'Estado', c: (r) => pill(r.estado, USER_ESTADO[r.estado] || 'neutral') }],
    fields: [{ k: 'nombre', label: 'Nombre', type: 'text', required: true }, { k: 'apellido', label: 'Apellido', type: 'text', required: true }, { k: 'correo', label: 'Correo', type: 'email', required: true }, { k: 'contrasena', label: 'Contraseña', type: 'password', required: true, createOnly: true, hint: 'se almacena con hash bcrypt (RNF-004)' }, { k: 'id_rol', label: 'Rol', type: 'ref', ref: 'roles', required: true }, { k: 'id_nivel', label: 'Nivel educativo', type: 'ref', ref: 'niveles-educativos' }, { k: 'estado', label: 'Estado', type: 'select', editOnly: true, options: ['pendiente', 'activo', 'bloqueado_temporal', 'inactivo', 'eliminado_logico'] }] },
  matriculas: { pk: 'id_matricula', singular: 'Matrícula', plural: 'Matrículas', group: 'Transaccionales', label: (r) => `Matrícula #${r.id_matricula}`,
    columns: [{ h: 'ID', cls: 'col-id', c: (r) => r.id_matricula }, { h: 'Usuario', c: (r) => refLabel('usuarios', r.id_usuario) }, { h: 'Institución', c: (r) => refLabel('instituciones', r.id_institucion) }, { h: 'Fecha', cls: 'cell-muted', c: (r) => fmtDate(r.fecha_matricula) }],
    fields: [{ k: 'id_usuario', label: 'Usuario', type: 'ref', ref: 'usuarios', required: true }, { k: 'id_institucion', label: 'Institución', type: 'ref', ref: 'instituciones', required: true }, { k: 'fecha_matricula', label: 'Fecha de matrícula', type: 'datetime' }] },
  modulos: { pk: 'id_modulo', singular: 'Módulo', plural: 'Módulos', group: 'Transaccionales', label: (r) => r.titulo,
    columns: [{ h: 'ID', cls: 'col-id', c: (r) => r.id_modulo }, { h: 'Título', c: (r) => `<strong>${esc(r.titulo)}</strong>` }, { h: 'Contenido', c: (r) => refLabel('tipos-contenido', r.id_tipo_contenido) }, { h: 'Nivel', c: (r) => refLabel('niveles-educativos', r.id_nivel) }, { h: 'Estado', c: (r) => boolPill(r.activo, 'publicado', 'inactivo') }],
    fields: [{ k: 'titulo', label: 'Título', type: 'text', required: true }, { k: 'descripcion', label: 'Descripción', type: 'textarea', required: true }, { k: 'id_tipo_contenido', label: 'Tipo de contenido', type: 'ref', ref: 'tipos-contenido', required: true }, { k: 'id_nivel', label: 'Nivel educativo', type: 'ref', ref: 'niveles-educativos', required: true }, { k: 'area_curricular', label: 'Área curricular', type: 'text' }, { k: 'id_docente', label: 'Docente', type: 'ref', ref: 'usuarios', required: true }, { k: 'activo', label: 'Publicado', type: 'bool', default: true }] },
  actividades: { pk: 'id_actividad', singular: 'Actividad', plural: 'Actividades', group: 'Transaccionales', label: (r) => r.titulo,
    columns: [{ h: 'ID', cls: 'col-id', c: (r) => r.id_actividad }, { h: 'Título', c: (r) => `<strong>${esc(r.titulo)}</strong>` }, { h: 'Tipo', c: (r) => refLabel('tipos-actividad', r.id_tipo_actividad) }, { h: 'Módulo', c: (r) => refLabel('modulos', r.id_modulo) }, { h: 'Pje. máx.', cls: 'col-num', c: (r) => r.puntaje_maximo }],
    fields: [{ k: 'titulo', label: 'Título', type: 'text', required: true }, { k: 'descripcion', label: 'Descripción', type: 'textarea', required: true }, { k: 'id_tipo_actividad', label: 'Tipo de actividad', type: 'ref', ref: 'tipos-actividad', required: true }, { k: 'id_modulo', label: 'Módulo', type: 'ref', ref: 'modulos', required: true }, { k: 'id_docente', label: 'Docente', type: 'ref', ref: 'usuarios', required: true }, { k: 'instrucciones', label: 'Instrucciones', type: 'textarea', required: true }, { k: 'criterio_evaluacion', label: 'Criterio de evaluación', type: 'textarea', required: true }, { k: 'puntaje_maximo', label: 'Puntaje máximo', type: 'number', required: true, min: 1 }] },
  progresos: { pk: 'id_progreso', singular: 'Progreso', plural: 'Progreso de estudiantes', group: 'Transaccionales', label: (r) => `Progreso #${r.id_progreso}`,
    columns: [{ h: 'ID', cls: 'col-id', c: (r) => r.id_progreso }, { h: 'Estudiante', c: (r) => refLabel('usuarios', r.id_estudiante) }, { h: 'Actividad', c: (r) => refLabel('actividades', r.id_actividad) }, { h: 'Puntaje', cls: 'col-num', c: (r) => r.puntaje_obtenido }, { h: 'Estado', c: (r) => pill(r.estado, r.estado === 'completado' ? 'ok' : 'warn') }],
    fields: [{ k: 'id_estudiante', label: 'Estudiante', type: 'ref', ref: 'usuarios', required: true }, { k: 'id_actividad', label: 'Actividad', type: 'ref', ref: 'actividades', required: true }, { k: 'puntaje_obtenido', label: 'Puntaje obtenido', type: 'number', default: 0 }, { k: 'estado', label: 'Estado', type: 'select', options: ['en_progreso', 'completado'] }] },
  historiales: { pk: 'id_historial', singular: 'Historial', plural: 'Historial de práctica', group: 'Transaccionales', label: (r) => `Historial #${r.id_historial}`,
    columns: [{ h: 'ID', cls: 'col-id', c: (r) => r.id_historial }, { h: 'Estudiante', c: (r) => refLabel('usuarios', r.id_estudiante) }, { h: 'Módulo', c: (r) => refLabel('modulos', r.id_modulo) }, { h: 'Pje. total', cls: 'col-num', c: (r) => r.puntaje_total }, { h: 'Resultado', c: (r) => boolPill(r.modulo_aprobado, 'aprobado', 'no aprobado') }],
    fields: [{ k: 'id_estudiante', label: 'Estudiante', type: 'ref', ref: 'usuarios', required: true }, { k: 'id_modulo', label: 'Módulo', type: 'ref', ref: 'modulos', required: true }, { k: 'fecha_inicio', label: 'Fecha inicio', type: 'datetime', required: true }, { k: 'fecha_fin', label: 'Fecha fin', type: 'datetime', required: true }, { k: 'puntaje_total', label: 'Puntaje total', type: 'number', default: 0 }, { k: 'actividades_completadas', label: 'Actividades completadas', type: 'number', default: 0 }, { k: 'modulo_aprobado', label: 'Módulo aprobado', type: 'bool', default: false }] },
  reportes: { pk: 'id_reporte', singular: 'Reporte', plural: 'Reportes', group: 'Transaccionales', label: (r) => `Reporte #${r.id_reporte}`,
    columns: [{ h: 'ID', cls: 'col-id', c: (r) => r.id_reporte }, { h: 'Tipo', c: (r) => pill(r.tipo, 'accent') }, { h: 'Formato', c: (r) => pill(r.formato, 'neutral') }, { h: 'Autor', c: (r) => refLabel('usuarios', r.id_generado_por) }, { h: 'Rango', cls: 'cell-muted', c: (r) => esc(r.rango) }],
    fields: [{ k: 'tipo', label: 'Tipo', type: 'select', required: true, options: ['individual', 'grupal', 'global'] }, { k: 'rango', label: 'Rango', type: 'text', required: true, hint: 'periodo o grupo que cubre' }, { k: 'id_generado_por', label: 'Generado por', type: 'ref', ref: 'usuarios', required: true }, { k: 'id_institucion', label: 'Institución', type: 'ref', ref: 'instituciones' }, { k: 'formato', label: 'Formato', type: 'select', required: true, options: ['PDF', 'Excel'] }, { k: 'contenido_url', label: 'URL del contenido', type: 'text', required: true }] },

  /* ── Contenido evaluable (CU-001 · RF-012,RF-016) ── */
  preguntas: { pk: 'id_pregunta', singular: 'Pregunta', plural: 'Preguntas', group: 'Contenido', label: (r) => (r.enunciado || '').slice(0, 48),
    columns: [{ h: 'ID', cls: 'col-id', c: (r) => r.id_pregunta }, { h: 'Actividad', c: (r) => refLabel('actividades', r.id_actividad) }, { h: 'Enunciado', c: (r) => `<strong>${esc(r.enunciado)}</strong>` }, { h: 'Pts', cls: 'col-num', c: (r) => r.puntaje }, { h: 'Intentos', cls: 'col-num', c: (r) => r.max_intentos }],
    fields: [{ k: 'id_actividad', label: 'Actividad', type: 'ref', ref: 'actividades', required: true }, { k: 'enunciado', label: 'Enunciado', type: 'textarea', required: true }, { k: 'orden', label: 'Orden', type: 'number', default: 1 }, { k: 'puntaje', label: 'Puntaje', type: 'number', default: 1 }, { k: 'max_intentos', label: 'Máx. intentos', type: 'number', default: 3, min: 1, hint: 'CU-001 A2 — reintentos por pregunta' }, { k: 'retroalimentacion', label: 'Retroalimentación', type: 'textarea' }] },
  opciones: { pk: 'id_opcion', singular: 'Opción', plural: 'Opciones', group: 'Contenido', label: (r) => r.texto,
    columns: [{ h: 'ID', cls: 'col-id', c: (r) => r.id_opcion }, { h: 'Pregunta', c: (r) => refLabel('preguntas', r.id_pregunta) }, { h: 'Texto', c: (r) => `<strong>${esc(r.texto)}</strong>` }, { h: 'Correcta', c: (r) => (r.es_correcta ? pill('correcta', 'ok') : pill('—', 'neutral')) }],
    fields: [{ k: 'id_pregunta', label: 'Pregunta', type: 'ref', ref: 'preguntas', required: true }, { k: 'texto', label: 'Texto de la opción', type: 'text', required: true }, { k: 'es_correcta', label: '¿Es la correcta?', type: 'bool', default: false }, { k: 'orden', label: 'Orden', type: 'number', default: 1 }] },
  notificaciones: { pk: 'id_notificacion', singular: 'Notificación', plural: 'Notificaciones', group: 'Contenido', label: (r) => (r.mensaje || '').slice(0, 40),
    columns: [{ h: 'ID', cls: 'col-id', c: (r) => r.id_notificacion }, { h: 'Usuario', c: (r) => refLabel('usuarios', r.id_usuario) }, { h: 'Tipo', c: (r) => pill(r.tipo, 'accent') }, { h: 'Mensaje', cls: 'cell-muted', c: (r) => esc(r.mensaje) }, { h: 'Leída', c: (r) => boolPill(r.leida, 'leída', 'no leída') }],
    fields: [{ k: 'id_usuario', label: 'Usuario', type: 'ref', ref: 'usuarios', required: true }, { k: 'tipo', label: 'Tipo', type: 'text', required: true }, { k: 'mensaje', label: 'Mensaje', type: 'textarea', required: true }, { k: 'leida', label: 'Leída', type: 'bool', default: false }] },
};
const GROUPS = ['Maestras', 'Transaccionales', 'Contenido'];

const refCache = {};
async function loadRef(path) {
  if (refCache[path]) return refCache[path];
  const list = await api('GET', path);
  const byId = new Map(); const pk = R[path].pk;
  list.forEach((row) => byId.set(row[pk], row));
  refCache[path] = { list, byId };
  return refCache[path];
}
function refLabel(path, id) {
  if (id == null) return '<span class="cell-muted">—</span>';
  const row = refCache[path] && refCache[path].byId.get(id);
  if (!row) return `<span class="cell-muted">#${esc(id)}</span>`;
  return esc(R[path].label(row));
}
function invalidateRef(path) { delete refCache[path]; }

function toast(msg, kind = 'info', code) {
  const el = document.createElement('div');
  el.className = `toast toast--${kind}`;
  el.innerHTML = `<span class="toast__bar"></span><span>${esc(msg)}${code ? ` <code>${esc(code)}</code>` : ''}</span>`;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => { el.style.transition = 'opacity .3s, transform .3s'; el.style.opacity = '0'; el.style.transform = 'translateY(6px)'; }, 3600);
  setTimeout(() => el.remove(), 4000);
}

function confirmDialog(title, msg, okLabel = 'Confirmar') {
  return new Promise((resolve) => {
    const box = document.getElementById('confirm');
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-msg').textContent = msg;
    const ok = document.getElementById('confirm-ok'); ok.textContent = okLabel;
    box.setAttribute('aria-hidden', 'false');
    const close = (val) => { box.setAttribute('aria-hidden', 'true'); ok.onclick = null; box.querySelectorAll('[data-confirm-cancel]').forEach((b) => (b.onclick = null)); resolve(val); };
    ok.onclick = () => close(true);
    box.querySelectorAll('[data-confirm-cancel]').forEach((b) => (b.onclick = () => close(false)));
  });
}

async function openForm(path, record) {
  const def = R[path]; const isEdit = !!record;
  const refPaths = [...new Set(def.fields.filter((f) => f.type === 'ref').map((f) => f.ref))];
  await Promise.all(refPaths.map(loadRef));
  document.getElementById('drawer-title').textContent = `${isEdit ? 'Editar' : 'Nuevo'} · ${def.singular}`;
  const form = document.getElementById('drawer-form');
  form.innerHTML = def.fields.filter((f) => (isEdit ? !f.createOnly : !f.editOnly)).map((f) => fieldHTML(f, record)).join('') +
    `<div class="form__error" id="form-error"></div><div class="form__actions"><button type="button" class="btn btn--ghost" data-drawer-close>Cancelar</button><button type="submit" class="btn btn--primary">${isEdit ? 'Guardar cambios' : 'Crear'}</button></div>`;
  form.querySelectorAll('[data-drawer-close]').forEach((b) => (b.onclick = () => setDrawer(false)));
  form.onsubmit = (e) => { e.preventDefault(); submitForm(path, record); };
  setDrawer(true);
}
function fieldHTML(f, record) {
  const val = record ? record[f.k] : f.default;
  const req = f.required ? ' <span class="req">*</span>' : '';
  const hint = f.hint ? `<span class="field__hint">${esc(f.hint)}</span>` : '';
  let control = '';
  if (f.type === 'textarea') control = `<textarea class="textarea" name="${f.k}" ${f.required ? 'required' : ''}>${esc(val)}</textarea>`;
  else if (f.type === 'bool') control = `<label class="check"><input type="checkbox" name="${f.k}" ${val ? 'checked' : ''} /> <span>Sí</span></label>`;
  else if (f.type === 'select') control = `<select class="select" name="${f.k}" ${f.required ? 'required' : ''}><option value="">— seleccionar —</option>${f.options.map((o) => `<option value="${esc(o)}" ${String(val) === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
  else if (f.type === 'ref') {
    const list = (refCache[f.ref] && refCache[f.ref].list) || []; const pk = R[f.ref].pk;
    control = `<select class="select" name="${f.k}" ${f.required ? 'required' : ''}><option value="">— seleccionar —</option>${list.map((row) => { const id = row[pk]; return `<option value="${esc(id)}" ${String(val) === String(id) ? 'selected' : ''}>${esc(R[f.ref].label(row))} · #${esc(id)}</option>`; }).join('')}</select>`;
  } else {
    const type = f.type === 'datetime' ? 'datetime-local' : f.type;
    const min = f.min != null ? `min="${f.min}"` : '';
    const v = f.type === 'datetime' && val ? toLocalInput(val) : esc(val);
    control = `<input class="input" type="${type}" name="${f.k}" value="${v}" ${min} ${f.required ? 'required' : ''} />`;
  }
  return `<div class="field"><label class="field__label">${esc(f.label)}${req}</label>${control}${hint}</div>`;
}
function toLocalInput(v) { const d = new Date(v); if (isNaN(d)) return ''; const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; }

async function submitForm(path, record) {
  const def = R[path]; const form = document.getElementById('drawer-form');
  const errBox = document.getElementById('form-error'); errBox.classList.remove('is-shown');
  const isEdit = !!record; const payload = {};
  def.fields.filter((f) => (isEdit ? !f.createOnly : !f.editOnly)).forEach((f) => {
    const el = form.elements[f.k]; if (!el) return;
    if (f.type === 'bool') { payload[f.k] = el.checked; return; }
    let v = el.value;
    if (v === '') { if (!f.required) return; payload[f.k] = v; return; }
    if (f.type === 'number' || f.type === 'ref') v = Number(v);
    if (f.type === 'datetime') v = new Date(v).toISOString();
    payload[f.k] = v;
  });
  try {
    if (isEdit) { await api('PUT', `${path}/${record[def.pk]}`, payload); toast(`${def.singular} actualizado`, 'ok'); }
    else { await api('POST', path, payload); toast(`${def.singular} creado`, 'ok'); }
    invalidateRef(path); setDrawer(false); renderView(path);
  } catch (err) { errBox.textContent = `Error ${err.status || ''}: ${err.message}`; errBox.classList.add('is-shown'); }
}
function setDrawer(open) { document.getElementById('drawer').setAttribute('aria-hidden', open ? 'false' : 'true'); }

async function deleteRow(path, row) {
  const def = R[path]; const id = row[def.pk]; const isSoft = !!def.deleteLabel;
  const ok = await confirmDialog(
    isSoft ? `Desactivar ${def.singular.toLowerCase()}` : `Eliminar ${def.singular.toLowerCase()}`,
    isSoft ? `Se hará una desactivación lógica (estado → inactivo). El historial académico se conserva. (E14-DE03)` : `Se eliminará "${def.label(row)}" de forma permanente.`,
    isSoft ? 'Desactivar' : 'Eliminar');
  if (!ok) return;
  try { await api('DELETE', `${path}/${id}`); toast(isSoft ? `${def.singular} desactivado` : `${def.singular} eliminado`, 'ok'); invalidateRef(path); renderView(path); }
  catch (err) { toast(err.message, 'bad', err.status); }
}

async function renderView(path) {
  const def = R[path]; const main = document.getElementById('main');
  main.innerHTML = `<div class="view"><div class="loading">cargando ${esc(def.plural.toLowerCase())}…</div></div>`;
  const refsUsed = [...new Set(def.columns.flatMap((col) => (col.c.toString().match(/refLabel\('([^']+)'/g) || []).map((s) => s.match(/refLabel\('([^']+)'/)[1])))];
  try {
    await Promise.all(refsUsed.map(loadRef));
    const rows = await api('GET', path);
    const head = def.columns.map((col) => `<th>${esc(col.h)}</th>`).join('') + '<th></th>';
    const body = rows.map((row) => {
      const tds = def.columns.map((col) => `<td class="${col.cls || ''}">${col.c(row)}</td>`).join('');
      const del = def.deleteLabel || 'Eliminar';
      return `<tr>${tds}<td><div class="row-actions"><button class="btn btn--ghost btn--sm" data-edit>Editar</button><button class="btn btn--ghost btn--sm" data-del>${esc(del)}</button></div></td></tr>`;
    }).join('');
    main.innerHTML = `<div class="view"><div class="view__head"><div><div class="view__kicker">${esc(def.group)}</div><h1 class="view__title">${esc(def.plural)}</h1><p class="view__sub">${rows.length} registro${rows.length === 1 ? '' : 's'} · <code style="font-family:var(--font-mono)">/api/${esc(path)}</code></p></div><button class="btn btn--primary" data-new>+ Nuevo</button></div>${rows.length ? `<div class="tablewrap"><div class="tbl-scroll"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div></div>` : `<div class="tablewrap"><div class="empty"><strong>Sin registros</strong>Crea el primer ${esc(def.singular.toLowerCase())} con “+ Nuevo”.</div></div>`}</div>`;
    main.querySelector('[data-new]').onclick = () => openForm(path, null);
    main.querySelectorAll('tbody tr').forEach((tr, i) => { tr.querySelector('[data-edit]').onclick = () => openForm(path, rows[i]); tr.querySelector('[data-del]').onclick = () => deleteRow(path, rows[i]); });
  } catch (err) { main.innerHTML = `<div class="view"><div class="empty"><strong>Error al cargar</strong>${esc(err.message)}</div></div>`; }
}

async function renderDashboard() {
  const main = document.getElementById('main');
  main.innerHTML = `<div class="view"><div class="loading">cargando panel…</div></div>`;
  const paths = Object.keys(R); const counts = {};
  await Promise.all(paths.map(async (p) => { try { counts[p] = (await api('GET', p)).length; } catch { counts[p] = '—'; } }));
  updateNavCounts(counts);
  const stat = (p) => `<div class="stat" data-go="panel/${p}"><div class="stat__n">${counts[p]}</div><div class="stat__l">${esc(R[p].plural)}</div></div>`;
  const maestras = paths.filter((p) => R[p].group === 'Maestras');
  const trans = paths.filter((p) => R[p].group === 'Transaccionales');
  main.innerHTML = `<div class="view"><div class="view__head"><div><div class="view__kicker">Panel docente · Plataforma IA K-12</div><h1 class="view__title">Gestión del módulo</h1><p class="view__sub">Crea los módulos y actividades que verán los estudiantes y haz seguimiento de su progreso. Administra las 12 entidades del modelo.</p></div></div><div class="section-title">Tablas maestras</div><div class="stat-grid">${maestras.map(stat).join('')}</div><div class="section-title">Tablas transaccionales</div><div class="stat-grid">${trans.map(stat).join('')}</div><div class="section-title">Reglas de negocio</div><div class="note">El backend implementa <strong>completar progreso</strong> (E14-DE02) y <strong>desactivación lógica de usuario</strong> (E14-DE03). Ejecútalas desde <a href="#/panel/reglas" style="color:var(--accent-ink)">Reglas de negocio</a>.</div></div>`;
  main.querySelectorAll('[data-go]').forEach((el) => (el.onclick = () => { location.hash = `#/${el.dataset.go}`; }));
}

async function renderRules() {
  const main = document.getElementById('main');
  main.innerHTML = `<div class="view"><div class="loading">cargando reglas…</div></div>`;
  await Promise.all([loadRef('usuarios'), loadRef('actividades')]);
  invalidateRef('progresos');
  let progresos = []; try { progresos = await api('GET', 'progresos'); } catch { }
  const pendientes = progresos.filter((p) => p.estado === 'en_progreso');
  const activos = refCache['usuarios'].list.filter((u) => u.estado === 'activo');
  main.innerHTML = `<div class="view"><div class="view__head"><div><div class="view__kicker">Lógica de negocio · capa de servicios</div><h1 class="view__title">Reglas de negocio</h1><p class="view__sub">Operaciones más allá del CRUD, con estados HTTP semánticos (409 / 422).</p></div></div>
    <div class="section-title">① Completar actividad <span class="pill pill--accent" style="vertical-align:middle">E14-DE02</span></div>
    <div class="note" style="margin-bottom:14px"><code>POST /api/progresos/:id/completar</code> — <code>en_progreso → completado</code>. Devuelve <strong>409</strong> si ya estaba completado y <strong>422</strong> si el puntaje supera el máximo.</div>
    ${pendientes.length ? pendientes.map((p) => { const max = (refCache['actividades'].byId.get(p.id_actividad) || {}).puntaje_maximo; return `<div class="rule" data-prog="${p.id_progreso}"><div class="rule__body"><div class="rule__title">${refLabel('usuarios', p.id_estudiante)} · ${refLabel('actividades', p.id_actividad)}</div><div class="rule__meta">progreso #${p.id_progreso} · puntaje máx: ${max != null ? max : '?'}</div></div><div class="rule__form"><input class="input rule__input" type="number" min="0" placeholder="puntaje" /><button class="btn btn--primary btn--sm" data-completar>Completar</button></div></div>`; }).join('') : `<div class="empty" style="padding:32px"><strong>Nada pendiente</strong>No hay progresos <code>en_progreso</code>.</div>`}
    <div class="section-title">② Desactivar usuario <span class="pill pill--accent" style="vertical-align:middle">E14-DE03</span></div>
    <div class="note" style="margin-bottom:14px"><code>DELETE /api/usuarios/:id</code> — soft-delete: <code>activo → inactivo</code>. El historial nunca se borra.</div>
    <div class="rule"><div class="rule__body"><div class="rule__title">Desactivación lógica</div><div class="rule__meta">${activos.length} usuario(s) activo(s)</div></div><div class="rule__form"><select class="select" id="desactivar-sel" style="min-width:200px"><option value="">— elegir usuario —</option>${activos.map((u) => `<option value="${u.id_usuario}">${esc(R['usuarios'].label(u))} · #${u.id_usuario}</option>`).join('')}</select><button class="btn btn--danger btn--sm" id="desactivar-btn">Desactivar</button></div></div></div>`;
  main.querySelectorAll('[data-prog]').forEach((row) => {
    row.querySelector('[data-completar]').onclick = async () => {
      const puntaje = Number(row.querySelector('input').value);
      try { await api('POST', `progresos/${row.dataset.prog}/completar`, { puntaje }); toast('Progreso completado', 'ok', '200'); renderRules(); }
      catch (err) { toast(err.message, 'bad', err.status); }
    };
  });
  main.querySelector('#desactivar-btn').onclick = async () => {
    const id = main.querySelector('#desactivar-sel').value;
    if (!id) { toast('Elige un usuario primero', 'info'); return; }
    const ok = await confirmDialog('Desactivar usuario', 'Soft-delete: el usuario pasa a inactivo y conserva su historial.', 'Desactivar');
    if (!ok) return;
    try { await api('DELETE', `usuarios/${id}`); toast('Usuario desactivado', 'ok', '200'); invalidateRef('usuarios'); renderRules(); }
    catch (err) { toast(err.message, 'bad', err.status); }
  };
}

/* ── CU-004 · RF-019 — Seguimiento del grupo (mapa de calor) ── */
async function renderSeguimiento() {
  const main = document.getElementById('main');
  main.innerHTML = `<div class="view"><div class="loading">cargando seguimiento…</div></div>`;
  try {
    const [usuarios, actividades, progresos, modulos] = await Promise.all([
      api('GET', 'usuarios'), api('GET', 'actividades'), api('GET', 'progresos'), api('GET', 'modulos'),
    ]);
    const estudiantes = usuarios.filter((u) => u.id_rol === 1);
    const modsWithActs = modulos.filter((m) => m.activo)
      .map((m) => ({ m, acts: actividades.filter((a) => a.id_modulo === m.id_modulo) })).filter((x) => x.acts.length);
    const flatActs = modsWithActs.flatMap((x) => x.acts);
    const progBy = new Map(progresos.map((p) => [`${p.id_estudiante}_${p.id_actividad}`, p]));
    const cell = (estId, a) => {
      const p = progBy.get(`${estId}_${a.id_actividad}`);
      if (!p) return `<td class="hm hm--empty" title="sin empezar">·</td>`;
      if (p.estado !== 'completado') return `<td class="hm hm--prog" title="en progreso">…</td>`;
      const pct = a.puntaje_maximo ? Math.round((p.puntaje_obtenido / a.puntaje_maximo) * 100) : 0;
      const lvl = pct >= 80 ? 'hi' : pct >= 50 ? 'mid' : 'lo';
      return `<td class="hm hm--${lvl}" title="${esc(a.titulo)}: ${pct}%">${pct}</td>`;
    };
    const groupHead = modsWithActs.map((x) => `<th colspan="${x.acts.length}" class="hm-group" title="${esc(x.m.titulo)}">${esc(x.m.titulo)}</th>`).join('');
    const actHead = flatActs.map((a, i) => `<th class="hm-act" title="${esc(a.titulo)}">${i + 1}</th>`).join('');
    const rows = estudiantes.map((e) => `<tr><th class="hm-name">${esc(e.nombre)} ${esc(e.apellido)}</th>${flatActs.map((a) => cell(e.id_usuario, a)).join('')}</tr>`).join('');

    const compP = progresos.filter((p) => p.estado === 'completado' && flatActs.some((a) => a.id_actividad === p.id_actividad) && estudiantes.some((e) => e.id_usuario === p.id_estudiante));
    const completitud = estudiantes.length && flatActs.length ? Math.round((compP.length / (estudiantes.length * flatActs.length)) * 100) : 0;
    const ratios = compP.map((p) => { const a = flatActs.find((x) => x.id_actividad === p.id_actividad); return a && a.puntaje_maximo ? p.puntaje_obtenido / a.puntaje_maximo : null; }).filter((v) => v != null);
    const promGrupo = ratios.length ? Math.round((ratios.reduce((s, v) => s + v, 0) / ratios.length) * 100) : 0;

    main.innerHTML = `<div class="view">
      <div class="view__head"><div><div class="view__kicker">Docente · CU-004 · RF-019</div><h1 class="view__title">Seguimiento del grupo</h1><p class="view__sub">Avance de cada estudiante por actividad. El número es el % logrado; pasa el cursor para el detalle.</p></div></div>
      <div class="stat-grid" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin-bottom:22px">
        <div class="stat"><div class="stat__n">${estudiantes.length}</div><div class="stat__l">Estudiantes</div></div>
        <div class="stat"><div class="stat__n">${flatActs.length}</div><div class="stat__l">Actividades</div></div>
        <div class="stat"><div class="stat__n">${completitud}%</div><div class="stat__l">Completitud</div></div>
        <div class="stat"><div class="stat__n">${promGrupo}%</div><div class="stat__l">Promedio del grupo</div></div>
      </div>
      ${estudiantes.length && flatActs.length
        ? `<div class="tablewrap"><div class="tbl-scroll"><table class="heat">
            <thead><tr><th class="hm-name"></th>${groupHead}</tr><tr><th class="hm-name">Estudiante</th>${actHead}</tr></thead>
            <tbody>${rows}</tbody></table></div></div>
           <p class="learn__hint" style="margin-top:12px">Leyenda: <span class="pill pill--ok">≥80</span> <span class="pill pill--warn">50–79</span> <span class="pill pill--bad">&lt;50</span> · <code style="font-family:var(--font-mono)">…</code> en progreso · <code style="font-family:var(--font-mono)">·</code> sin empezar</p>`
        : `<div class="empty"><strong>Sin datos suficientes</strong>Necesitas estudiantes y actividades publicadas para ver el seguimiento.</div>`}
    </div>`;
  } catch (err) { main.innerHTML = `<div class="view"><div class="empty"><strong>Error</strong>${esc(err.message)}</div></div>`; }
}

/* ── CU-005 · RF-022/023 — Generar reporte (registra en REPORTE) ── */
async function renderReporteGen() {
  const main = document.getElementById('main');
  main.innerHTML = `<div class="view"><div class="loading">cargando…</div></div>`;
  try {
    const [usuarios, actividades, progresos, modulos] = await Promise.all([
      api('GET', 'usuarios'), api('GET', 'actividades'), api('GET', 'progresos'), api('GET', 'modulos'),
    ]);
    const estudiantes = usuarios.filter((u) => u.id_rol === 1);
    const docente = usuarios.find((u) => u.id_usuario === getIdentity().userId) || { id_usuario: getIdentity().userId };
    const actById = new Map(actividades.map((a) => [a.id_actividad, a]));
    const modById = new Map(modulos.map((m) => [m.id_modulo, m]));
    main.innerHTML = `<div class="view">
      <div class="view__head"><div><div class="view__kicker">Docente · CU-005 · RF-022/023</div><h1 class="view__title">Generar reporte</h1><p class="view__sub">Construye un reporte de progreso, descárgalo y queda registrado en la tabla <code style="font-family:var(--font-mono)">REPORTE</code>.</p></div></div>
      <div class="repform">
        <div class="field"><label class="field__label">Tipo</label><select class="select" id="r-tipo"><option value="grupal">Grupal (todo el grupo)</option><option value="individual">Individual</option><option value="global">Global</option></select></div>
        <div class="field" id="r-estwrap" style="display:none"><label class="field__label">Estudiante</label><select class="select" id="r-est">${estudiantes.map((e) => `<option value="${e.id_usuario}">${esc(e.nombre)} ${esc(e.apellido)}</option>`).join('')}</select></div>
        <div class="field"><label class="field__label">Formato</label><select class="select" id="r-fmt"><option>PDF</option><option>Excel</option></select></div>
        <div class="field"><label class="field__label">Rango / periodo</label><input class="input" id="r-rango" value="Periodo actual"></div>
        <button class="btn btn--primary" id="r-gen">Generar</button>
      </div>
      <div id="r-out"></div>
    </div>`;
    const tipoSel = main.querySelector('#r-tipo');
    tipoSel.onchange = () => { main.querySelector('#r-estwrap').style.display = tipoSel.value === 'individual' ? '' : 'none'; };
    main.querySelector('#r-gen').onclick = async () => {
      const tipo = tipoSel.value, formato = main.querySelector('#r-fmt').value, rango = main.querySelector('#r-rango').value || 'Periodo actual';
      let dataset = progresos.filter((p) => p.estado === 'completado');
      let alcance = 'Todo el grupo';
      if (tipo === 'individual') {
        const estId = Number(main.querySelector('#r-est').value);
        dataset = dataset.filter((p) => p.id_estudiante === estId);
        const e = usuarios.find((u) => u.id_usuario === estId) || {};
        alcance = `${e.nombre} ${e.apellido}`;
      }
      const rows = dataset.map((p) => {
        const a = actById.get(p.id_actividad) || {}; const m = modById.get(a.id_modulo) || {};
        const e = usuarios.find((u) => u.id_usuario === p.id_estudiante) || {};
        return { estudiante: `${e.nombre || ''} ${e.apellido || ''}`.trim(), modulo: m.titulo || '', actividad: a.titulo || '', puntaje: p.puntaje_obtenido, max: a.puntaje_maximo || '', fecha: String(p.fecha_realizacion || '').slice(0, 10) };
      });
      let reporteId = '—', archivoUrl = null;
      try {
        // RF-022/RF-023 — el servidor genera el PDF/Excel y registra el REPORTE
        const body = { tipo, rango, formato, id_generado_por: docente.id_usuario };
        if (tipo === 'individual') body.id_estudiante = Number(main.querySelector('#r-est').value);
        const rep = await api('POST', 'reportes/generar', body);
        reporteId = rep.id_reporte; archivoUrl = rep.contenido_url; invalidateRef('reportes');
        toast('Reporte registrado en REPORTE', 'ok', '201');
      } catch (err) { toast('No se registró: ' + err.message, 'bad', err.status); }
      const totalPts = rows.reduce((s, r) => s + Number(r.puntaje || 0), 0);
      const out = main.querySelector('#r-out');
      out.innerHTML = `
        <div class="report" id="report-printable">
          <div class="report__head"><div><strong>Reporte ${esc(tipo)} · IA·K12</strong><div class="report__meta">${esc(alcance)} · ${esc(rango)} · ${rows.length} registros · ${totalPts} pts</div></div><div class="mono report__id">REPORTE #${esc(reporteId)}</div></div>
          <table class="report__tbl"><thead><tr><th>Estudiante</th><th>Módulo</th><th>Actividad</th><th>Puntaje</th><th>Fecha</th></tr></thead>
          <tbody>${rows.length ? rows.map((r) => `<tr><td>${esc(r.estudiante)}</td><td>${esc(r.modulo)}</td><td>${esc(r.actividad)}</td><td>${esc(r.puntaje)}/${esc(r.max)}</td><td>${esc(r.fecha)}</td></tr>`).join('') : '<tr><td colspan="5">Sin datos completados todavía.</td></tr>'}</tbody></table>
        </div>
        <div class="learn__actions"><button class="btn btn--primary" id="r-dl">Descargar ${formato === 'Excel' ? 'Excel (.xlsx)' : 'PDF'}</button></div>`;
      out.querySelector('#r-dl').onclick = async () => {
        if (archivoUrl) { // archivo real generado por el servidor (requiere sesión → fetch con token)
          try {
            const r = await fetch(archivoUrl, { headers: { Authorization: 'Bearer ' + getToken() } });
            if (!r.ok) throw new Error('HTTP ' + r.status);
            const url = URL.createObjectURL(await r.blob()); const a = document.createElement('a');
            a.href = url; a.download = archivoUrl.split('/').pop(); a.click(); URL.revokeObjectURL(url);
          } catch (err) { toast('No se pudo descargar: ' + err.message, 'bad'); }
          return;
        }
        if (formato === 'Excel') {
          const csv = ['Estudiante,Modulo,Actividad,Puntaje,Maximo,Fecha', ...rows.map((r) => [r.estudiante, r.modulo, r.actividad, r.puntaje, r.max, r.fecha].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
          const url = URL.createObjectURL(blob); const a = document.createElement('a');
          a.href = url; a.download = `reporte-${tipo}-${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url);
        } else { window.print(); }
      };
    };
  } catch (err) { main.innerHTML = `<div class="view"><div class="empty"><strong>Error</strong>${esc(err.message)}</div></div>`; }
}

/* ── Constructor de actividad guiado (actividad + preguntas + opciones) ── */
async function renderCrearActividad() {
  const main = document.getElementById('main');
  main.innerHTML = `<div class="view"><div class="loading">cargando…</div></div>`;
  try {
    const [tiposAct, modulos, usuarios] = await Promise.all([
      api('GET', 'tipos-actividad'), api('GET', 'modulos'), api('GET', 'usuarios'),
    ]);
    const docentes = usuarios.filter((u) => u.id_rol === 2);
    const opt = (arr, val, label) => arr.map((x) => `<option value="${x[val]}">${esc(typeof label === 'function' ? label(x) : x[label])}</option>`).join('');
    main.innerHTML = `<div class="view">
      <div class="view__head"><div><div class="view__kicker">Docente · CU-003 · RF-012 a RF-016</div><h1 class="view__title">Crear actividad</h1><p class="view__sub">Asistente: define la actividad y sus preguntas con opciones en un solo flujo. Al guardar, se notifica a los estudiantes.</p></div></div>
      <form id="wiz" class="wiz">
        <div class="wiz__grid">
          <div class="field"><label class="field__label">Título <span class="req">*</span></label><input class="input" name="titulo" required></div>
          <div class="field"><label class="field__label">Módulo <span class="req">*</span></label><select class="select" name="id_modulo" required><option value="">— elegir —</option>${opt(modulos, 'id_modulo', 'titulo')}</select></div>
          <div class="field"><label class="field__label">Tipo de actividad <span class="req">*</span></label><select class="select" name="id_tipo_actividad" required><option value="">— elegir —</option>${opt(tiposAct, 'id_tipo_actividad', 'nombre_tipo')}</select></div>
          <div class="field"><label class="field__label">Docente <span class="req">*</span></label><select class="select" name="id_docente" required><option value="">— elegir —</option>${opt(docentes, 'id_usuario', (u) => `${u.nombre} ${u.apellido}`)}</select></div>
          <div class="field"><label class="field__label">Puntaje máximo <span class="req">*</span></label><input class="input" type="number" name="puntaje_maximo" min="1" value="10" required></div>
        </div>
        <div class="field"><label class="field__label">Descripción <span class="req">*</span></label><textarea class="textarea" name="descripcion" required></textarea></div>
        <div class="field"><label class="field__label">Instrucciones <span class="req">*</span></label><textarea class="textarea" name="instrucciones" required></textarea></div>
        <div class="field"><label class="field__label">Criterio de evaluación <span class="req">*</span></label><textarea class="textarea" name="criterio_evaluacion" required></textarea></div>

        <h2 class="learn__h" style="margin-top:8px">Preguntas</h2>
        <div id="pregs"></div>
        <button type="button" class="btn" id="add-preg">+ Añadir pregunta</button>

        <div class="form__error" id="wiz-error"></div>
        <div class="form__actions" style="border-top:1px solid var(--line);padding-top:16px">
          <a class="btn btn--ghost" href="#/panel/actividades">Cancelar</a>
          <button class="btn btn--primary" type="submit">Crear actividad y notificar</button>
        </div>
      </form>
    </div>`;

    let pc = 0;
    const pregs = main.querySelector('#pregs');
    const addPregunta = () => {
      const i = pc++;
      const block = document.createElement('div');
      block.className = 'preg'; block.dataset.p = i;
      block.innerHTML = `
        <div class="preg__head"><span class="preg__n">Pregunta ${pregs.children.length + 1}</span><button type="button" class="iconbtn" data-delpreg title="Quitar">&times;</button></div>
        <input class="input preg-enun" placeholder="Enunciado de la pregunta" required>
        <div class="opts" data-opts></div>
        <button type="button" class="btn btn--sm" data-addopt>+ Opción</button>
        <p class="field__hint">Marca el círculo de la opción correcta.</p>`;
      pregs.appendChild(block);
      const optsBox = block.querySelector('[data-opts]');
      const addOpt = (correct) => {
        const row = document.createElement('div');
        row.className = 'opt-row';
        row.innerHTML = `<input type="radio" name="correct-${i}" ${correct ? 'checked' : ''} title="Correcta"><input class="input opt-text" placeholder="Texto de la opción"><button type="button" class="iconbtn" data-delopt title="Quitar">&times;</button>`;
        row.querySelector('[data-delopt]').onclick = () => row.remove();
        optsBox.appendChild(row);
      };
      addOpt(true); addOpt(false); addOpt(false);
      block.querySelector('[data-addopt]').onclick = () => addOpt(false);
      block.querySelector('[data-delpreg]').onclick = () => { block.remove(); renumber(); };
    };
    const renumber = () => pregs.querySelectorAll('.preg__n').forEach((el, idx) => (el.textContent = `Pregunta ${idx + 1}`));
    main.querySelector('#add-preg').onclick = () => { addPregunta(); renumber(); };
    addPregunta(); // empieza con una

    main.querySelector('#wiz').onsubmit = async (e) => {
      e.preventDefault();
      const f = e.target;
      const errBox = main.querySelector('#wiz-error'); errBox.classList.remove('is-shown');
      // Recoger preguntas
      const preguntas = [...pregs.querySelectorAll('.preg')].map((blk) => ({
        enunciado: blk.querySelector('.preg-enun').value.trim(),
        opciones: [...blk.querySelectorAll('.opt-row')].map((r) => ({ texto: r.querySelector('.opt-text').value.trim(), correcta: r.querySelector('input[type=radio]').checked })).filter((o) => o.texto),
      })).filter((p) => p.enunciado && p.opciones.length >= 2);
      const sinCorrecta = preguntas.find((p) => !p.opciones.some((o) => o.correcta));
      if (preguntas.length && sinCorrecta) { errBox.textContent = 'Cada pregunta necesita al menos 2 opciones y una marcada como correcta.'; errBox.classList.add('is-shown'); return; }
      const btn = f.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Guardando…';
      try {
        const actBody = {
          titulo: f.titulo.value, descripcion: f.descripcion.value,
          id_tipo_actividad: Number(f.id_tipo_actividad.value), id_modulo: Number(f.id_modulo.value),
          id_docente: Number(f.id_docente.value), instrucciones: f.instrucciones.value,
          criterio_evaluacion: f.criterio_evaluacion.value, puntaje_maximo: Number(f.puntaje_maximo.value),
        };
        const act = await api('POST', 'actividades', actBody);
        let orden = 1;
        for (const p of preguntas) {
          const preg = await api('POST', 'preguntas', { id_actividad: act.id_actividad, enunciado: p.enunciado, orden: orden++, puntaje: 1, max_intentos: 3 });
          let oo = 1;
          for (const o of p.opciones) await api('POST', 'opciones', { id_pregunta: preg.id_pregunta, texto: o.texto, es_correcta: o.correcta, orden: oo++ });
        }
        await notifyAllStudents('actividad_asignada', `📚 Nueva actividad disponible: "${act.titulo}". ¡Entra a resolverla!`);
        invalidateRef('actividades');
        toast(`Actividad creada con ${preguntas.length} pregunta(s) · estudiantes notificados`, 'ok', '201');
        location.hash = '#/panel/actividades';
      } catch (err) {
        errBox.textContent = `Error ${err.status || ''}: ${err.message}`; errBox.classList.add('is-shown');
        btn.disabled = false; btn.textContent = 'Crear actividad y notificar';
      }
    };
  } catch (err) { main.innerHTML = `<div class="view"><div class="empty"><strong>Error</strong>${esc(err.message)}</div></div>`; }
}

/* ─────────────────────────────────────────────────────────────
   Navegación + router (según rol)
   ───────────────────────────────────────────────────────────── */
let navRole = null;

function buildChrome(id) {
  document.getElementById('brand-sub').textContent = id.role === 'estudiante' ? 'Aula de IA' : 'Panel docente';
  const nav = document.getElementById('nav');
  if (id.role === 'estudiante') {
    nav.innerHTML = `<div class="nav__group"><button class="nav__item" data-route="explorar"><span>Explorar</span></button><button class="nav__item" data-route="notificaciones"><span>Notificaciones</span><span class="nav__badge" id="notif-badge"></span></button><button class="nav__item" data-route="progreso"><span>Mi progreso</span></button></div>`;
  } else {
    let html = `<div class="nav__group"><div class="nav__label">Sistema</div><button class="nav__item" data-route="panel"><span>Panel</span></button><button class="nav__item" data-route="panel/seguimiento"><span>Seguimiento del grupo</span></button><button class="nav__item" data-route="panel/crear-actividad"><span>Crear actividad</span></button><button class="nav__item" data-route="panel/generar-reporte"><span>Generar reporte</span></button><button class="nav__item" data-route="panel/reglas"><span>Reglas de negocio</span></button></div>`;
    GROUPS.forEach((g) => {
      const items = Object.keys(R).filter((p) => R[p].group === g);
      html += `<div class="nav__group"><div class="nav__label">${esc(g)}</div>${items.map((p) => `<button class="nav__item" data-route="panel/${p}"><span>${esc(R[p].plural)}</span><span class="nav__count" data-count="${p}"></span></button>`).join('')}</div>`;
    });
    nav.innerHTML = html;
  }
  nav.querySelectorAll('[data-route]').forEach((b) => (b.onclick = () => { location.hash = `#/${b.dataset.route}`; document.querySelector('.sidebar').classList.remove('is-open'); }));

  const ident = document.getElementById('identity');
  ident.innerHTML = `
    <div class="ident__row">
      <div class="ident__av">${esc((id.name[0] || '?').toUpperCase())}</div>
      <div class="ident__info"><strong>${esc(id.name)}</strong><small>${id.idRol === 3 ? 'Administrador' : id.role === 'estudiante' ? 'Estudiante' : 'Docente'}</small></div>
    </div>
    <button class="ident__switch" title="Cerrar sesión">⎋ Cerrar sesión</button>`;
  ident.querySelector('.ident__switch').onclick = async () => {
    const ok = await confirmDialog('Cerrar sesión', '¿Salir y volver a la pantalla de inicio de sesión?', 'Salir');
    if (!ok) return;
    clearIdentity(); navRole = null; location.hash = ''; router();
  };
  refreshNotifBadge();
}
function updateNavCounts(counts) { Object.entries(counts || {}).forEach(([p, n]) => { const el = document.querySelector(`[data-count="${p}"]`); if (el) el.textContent = n; }); }
function setActiveNav(route) { document.querySelectorAll('.nav__item').forEach((b) => b.classList.toggle('is-active', b.dataset.route === route)); }

function router() {
  const id = getIdentity();
  if (!id) { navRole = null; return renderGate(); }
  document.querySelector('.shell').classList.remove('no-id');
  if (navRole !== id.role) { buildChrome(id); navRole = id.role; }

  const h = location.hash.replace(/^#\//, '');
  const [s0, s1] = h.split('/');

  if (id.role === 'estudiante') {
    setActiveNav(s0 || 'explorar');
    if (!h || s0 === 'explorar') return renderExplorar();
    if (s0 === 'modulo') return renderModulo(s1);
    if (s0 === 'actividad') return renderActividad(s1);
    if (s0 === 'notificaciones') return renderNotificaciones();
    if (s0 === 'progreso') return renderMiProgreso();
    location.hash = '#/explorar';
  } else {
    setActiveNav(s1 ? `panel/${s1}` : 'panel');
    if (!h || (s0 === 'panel' && !s1)) return renderDashboard();
    if (s0 === 'panel' && s1 === 'reglas') return renderRules();
    if (s0 === 'panel' && s1 === 'seguimiento') return renderSeguimiento();
    if (s0 === 'panel' && s1 === 'crear-actividad') return renderCrearActividad();
    if (s0 === 'panel' && s1 === 'generar-reporte') return renderReporteGen();
    if (s0 === 'panel' && R[s1]) return renderView(s1);
    location.hash = '#/panel';
  }
}

/* ── Health ───────────────────────────────────────────────── */
async function checkHealth() {
  const dot = document.getElementById('health-dot'); const txt = document.getElementById('health-text');
  try { const h = await api('GET', 'health'); dot.className = `dot dot--${h.db === 'connected' ? 'ok' : 'bad'}`; txt.textContent = h.db === 'connected' ? 'Conectado' : 'BD desconectada'; }
  catch { dot.className = 'dot dot--bad'; txt.textContent = 'Sin conexión'; }
}

/* ── Init ─────────────────────────────────────────────────── */
document.querySelectorAll('[data-drawer-close]').forEach((b) => (b.onclick = () => setDrawer(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setDrawer(false); document.getElementById('confirm').setAttribute('aria-hidden', 'true'); } });
window.addEventListener('hashchange', router);
checkHealth(); setInterval(checkHealth, 20000);
router();
