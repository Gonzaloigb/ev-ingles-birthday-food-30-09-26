/**
 * ZONA 6 — Test practice
 *
 * Como la prueba de verdad: auditiva, guiada y escrita, con los cuatro puntos
 * del temario mezclados y sin ayudas.
 *
 * `forzarDuro: true` silencia el apoyo y las pistas aunque se juegue en modo
 * normal, y ademas esconde el texto en ingles: hay que entenderlo de oido, que
 * es como sera la prueba. No quita vidas — perder el ensayo a la tercera no le
 * ensena nada a nadie.
 *
 * El reparto sigue los cuatro puntos del temario, con mas peso en lo que Marina
 * falla de verdad:
 *   4 vocabulario de cumpleanos · 3 comidas y su origen ·
 *   2 Have you got (ya lo domina) · 4 likes/dislikes (su error real) ·
 *   2 escribir
 */

import {
  CUMPLEANOS, COMIDAS, OLLA, ORIGENES, PERSONAS, PRIORITARIAS,
  HAVE_YOU_GOT, fraseGusto, palabra, AVISOS,
} from '../datos.js';
import { el, barajar, uno, elegirCon } from '../util.js';
import { correrZona } from '../motor.js';
import { guardarSimulacro } from '../estado.js';

const TOTAL = 15;

const COMIDAS_FRASE = [...CUMPLEANOS, ...COMIDAS]
  .filter((c) => c.esComida !== false)
  .map((c) => c.en);

export function jugarSimulacro({ zona, onSalir, onFin, modo }) {
  const guion = barajar([
    'vocab', 'vocab', 'vocab', 'vocab',
    'origen', 'origen', 'origen',
    'haveyougot', 'haveyougot',
    'gustos', 'gustos', 'gustos', 'gustos',
    'escribir', 'escribir',
  ]);

  correrZona({
    zona,
    total: TOTAL,
    onSalir,
    modo,
    forzarDuro: true,
    onFin(r) {
      guardarSimulacro(r.aciertos, r.total);
      onFin(r);
    },
    montar(ctx, i) {
      switch (guion[i]) {
        case 'vocab': return preguntaVocab(ctx);
        case 'origen': return preguntaOrigen(ctx);
        case 'haveyougot': return preguntaHaveYouGot(ctx);
        case 'gustos': return preguntaGustos(ctx);
        case 'escribir': return preguntaEscribir(ctx);
        default: throw new Error(`Pregunta desconocida: ${guion[i]}`);
      }
    },
  });
}

/* ---------- Helper: alternativas y cierre ---------- */
function armar(ctx, { cartas, esCorrecta, clase = 'tres', palabra: pal, mensajeMal }) {
  const opciones = el('div', `opciones ${clase}`);

  cartas.forEach((c, idx) => {
    const btn = el('button', c.html ? 'opcion' : 'opcion solo-texto',
      c.html || c.texto, { type: 'button', 'data-i': String(idx) });

    btn.addEventListener('click', () => {
      if (btn.classList.contains('bloqueada')) return;
      [...opciones.children].forEach((o) => o.classList.add('bloqueada'));

      const acerto = esCorrecta(c);
      btn.classList.add(acerto ? 'correcta' : 'errada');
      if (!acerto) {
        const iBuena = cartas.findIndex(esCorrecta);
        opciones.querySelector(`[data-i="${iBuena}"]`)?.classList.add('correcta');
      }

      ctx.responder({
        acerto,
        palabra: typeof pal === 'function' ? pal(c) : pal,
        mensajeBien: uno(AVISOS.bien),
        mensajeMal: typeof mensajeMal === 'function' ? mensajeMal(c) : mensajeMal,
        pista: null,   // el ensayo mide, no ensena
      });
    });
    opciones.append(btn);
  });

  ctx.zonaJuego.append(opciones);
}

/* ---------- 1. Vocabulario de cumpleanos ---------- */
function preguntaVocab(ctx) {
  const p = uno(CUMPLEANOS);
  ctx.pedir({ instruccion: 'Escucha y toca la imagen correcta', textoIngles: p.en, mostrar: false });

  armar(ctx, {
    cartas: barajar(elegirCon(CUMPLEANOS, p, 4))
      .map((c) => ({ html: `<span class="emoji">${c.emoji}</span>`, en: c.en })),
    esCorrecta: (c) => c.en === p.en,
    clase: 'cuatro',
    palabra: p.en,
    mensajeMal: `Era <b>${p.en}</b>.`,
  });
}

/* ---------- 2. Food from animals / plants ---------- */
function preguntaOrigen(ctx) {
  const c = uno(COMIDAS);
  ctx.pedir({ instruccion: `${c.en} — ¿de dónde viene?`, textoIngles: c.en, mostrar: false });

  const t = el('div', 'tarjeta-emoji', `<span class="emoji grande">${c.emoji}</span>`);
  ctx.zonaJuego.append(t);

  armar(ctx, {
    cartas: [
      { texto: `🐄 ${ORIGENES.animals.en}`, de: 'animals' },
      { texto: `🌱 ${ORIGENES.plants.en}`, de: 'plants' },
    ],
    esCorrecta: (x) => x.de === c.de,
    clase: 'dos',
    palabra: c.de === 'animals' ? 'food-animals' : 'food-plants',
    mensajeMal: `${c.en} es ${ORIGENES[c.de].en}.`,
  });
}

/* ---------- 3. Have you got…? ---------- */
function preguntaHaveYouGot(ctx) {
  const comida = uno([...OLLA, ...CUMPLEANOS]).en;
  const tiene = Math.random() < 0.5;
  const pregunta = HAVE_YOU_GOT.pregunta(comida);

  ctx.pedir({
    instruccion: tiene
      ? `Te preguntan "${pregunta}" y SÍ lo tienes. ¿Qué respondes?`
      : `Te preguntan "${pregunta}" y NO lo tienes. ¿Qué respondes?`,
    textoIngles: pregunta,
    mostrar: false,
  });

  armar(ctx, {
    cartas: barajar([
      { texto: HAVE_YOU_GOT.si, ok: tiene },
      { texto: HAVE_YOU_GOT.no, ok: !tiene },
    ]),
    esCorrecta: (c) => c.ok,
    clase: 'dos',
    palabra: 'have-you-got',
    mensajeMal: `Era: <b>${tiene ? HAVE_YOU_GOT.si : HAVE_YOU_GOT.no}</b>`,
  });
}

/* ---------- 4. Likes / dislikes: el error real ---------- */
function preguntaGustos(ctx) {
  const quien = uno(PERSONAS);
  const comida = uno(COMIDAS_FRASE);
  const gusta = Math.random() < 0.5;
  const frase = fraseGusto(quien.id, comida, gusta);
  const correcta = gusta ? quien.verbo : quien.negativo;

  ctx.pedir({ instruccion: 'Completa la frase', textoIngles: frase, mostrar: false });

  ctx.zonaJuego.append(el('div', 'frase-hueco',
    `<b>${quien.sujeto}</b> <span class="hueco">?</span> <b>${comida}</b>.`));

  const todas = [...new Set([
    quien.verbo, quien.negativo,
    quien.id === 'I' ? 'likes' : 'like',
    quien.id === 'I' ? "doesn't like" : "don't like",
  ])];

  armar(ctx, {
    cartas: barajar(todas).map((t) => ({ texto: t })),
    esCorrecta: (c) => c.texto === correcta,
    clase: 'dos',
    palabra: 'tercera-persona',
    mensajeMal: `Era: <b>${frase}</b>`,
  });
}

/* ---------- 5. Escribir ---------- */
function preguntaEscribir(ctx) {
  const p = palabra(uno(PRIORITARIAS));

  ctx.pedir({ instruccion: 'Escucha y escribe la palabra', textoIngles: p.en, mostrar: false });

  const t = el('div', 'tarjeta-emoji', `<span class="emoji grande">${p.emoji}</span>`);
  ctx.zonaJuego.append(t);

  const campo = el('input', 'campo', '', {
    type: 'text', autocomplete: 'off', autocapitalize: 'off',
    autocorrect: 'off', spellcheck: 'false', placeholder: 'Escribe aquí…',
    'aria-label': 'Escribe la palabra que escuchaste',
  });
  const btn = el('button', 'btn-chico destacado', 'Comprobar', { type: 'button' });

  let respondido = false;
  const enviar = () => {
    if (respondido) return;
    const escrito = String(campo.value).trim().toLowerCase();
    if (!escrito) { campo.focus(); return; }
    respondido = true;

    const acerto = escrito === p.en.toLowerCase();
    campo.classList.add(acerto ? 'correcta' : 'errada');
    campo.disabled = true;
    btn.disabled = true;

    ctx.responder({
      acerto,
      palabra: p.en,
      mensajeBien: uno(AVISOS.bien),
      mensajeMal: `Era <b>${p.en}</b>.`,
      pista: null,
    });
  };

  campo.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') { ev.preventDefault(); enviar(); }
  });
  btn.addEventListener('click', enviar);

  const fila = el('div', 'fila-escribir');
  fila.append(campo, btn);
  ctx.zonaJuego.append(fila);
  campo.focus();
}
