/**
 * ZONA 3 — Listen! (Leccion 2, p.39)
 *
 * La zona mas parecida a la prueba: la profesora dijo que es AUDITIVA, y el
 * ejercicio del libro es la cancion con caras 🙂/🙁 que hay que emparejar.
 *
 * Aqui el texto en ingles NO se muestra por defecto: si se ve, no es escuchar,
 * es leer. Solo el boton de repetir y el de "mas lento".
 *
 * Tres formatos:
 *   A. Suena "He likes pizza" → marca la cara y la comida.
 *   B. Suena una frase de la cancion → le gusta o no le gusta.
 *   C. Suena una frase → de quien habla: he o she.
 *
 * Ocho preguntas. Las comidas salen de una bolsa y las lineas de la cancion
 * de otra: ninguna se repite en la vuelta.
 */

import { CANCION, CUMPLEANOS, fraseGusto, persona, pistaTerceraPersona, AVISOS } from '../datos.js';
import { el, barajar, uno, elegirCon, imagen, bolsa } from '../util.js';
import { correrZona } from '../motor.js';

const GUION = ['comida', 'gusta', 'quien', 'comida', 'gusta', 'quien', 'comida', 'gusta'];

export function jugarEscucha({ zona, onSalir, onFin, modo }) {
  const sacarLinea = bolsa(CANCION);
  const sacarComida = bolsa(CUMPLEANOS);

  correrZona({
    zona,
    total: GUION.length,
    onSalir,
    onFin,
    modo,
    montar(ctx, i) {
      switch (GUION[i]) {
        case 'comida': return montarQueComida(ctx, sacarComida());
        case 'gusta': return montarGustaONo(ctx, sacarLinea());
        case 'quien': return montarQuienEs(ctx, sacarLinea());
        default: throw new Error(`Formato desconocido: ${GUION[i]}`);
      }
    },
  });
}

/* ---------- Formato A: suena la frase, cual comida nombra ---------- */
function montarQueComida(ctx, p) {
  const quien = uno(['he', 'she']);
  const gusta = Math.random() < 0.6;
  // "He likes birthday cards", en plural como en la cancion: no "birthday card".
  const frase = fraseGusto(quien, p.enFrase || p.en, gusta);

  ctx.pedir({
    instruccion: 'Escucha. ¿De qué comida habla?',
    textoIngles: frase,
    mostrar: false,   // si se muestra, no es escuchar
  });

  const cartas = barajar(elegirCon(CUMPLEANOS, p, 3));
  const opciones = el('div', 'opciones tres');

  for (const c of cartas) {
    const btn = el('button', 'opcion',
      `${imagen(c)}<span class="pie">${c.en}</span>`,
      { type: 'button', 'data-en': c.en });

    btn.addEventListener('click', () => {
      if (btn.classList.contains('bloqueada')) return;
      [...opciones.children].forEach((o) => o.classList.add('bloqueada'));

      const acerto = c.en === p.en;
      btn.classList.add(acerto ? 'correcta' : 'errada');
      if (!acerto) opciones.querySelector(`[data-en="${p.en}"]`)?.classList.add('correcta');

      ctx.responder({
        acerto,
        palabra: p.en,
        mensajeBien: uno(AVISOS.bien),
        mensajeMal: `Decía: <b>${frase}</b>`,
        pista: `Vuelve a escucharla con el botón 🐢 Más lento.`,
      });
    });
    opciones.append(btn);
  }
  ctx.zonaJuego.append(opciones);
}

/* ---------- Formato B: le gusta o no le gusta ----------
   Es el ejercicio literal de la p.39: caras 🙂 y 🙁.                        */
function montarGustaONo(ctx, linea) {
  const frase = fraseGusto(linea.persona, linea.comida, linea.gusta);

  ctx.pedir({
    instruccion: 'Escucha. ¿Le gusta o no le gusta?',
    textoIngles: frase,
    mostrar: false,
  });

  const opciones = el('div', 'opciones dos');
  for (const op of [
    { v: true, t: '<span class="emoji">🙂</span><span class="pie">Le gusta</span>' },
    { v: false, t: '<span class="emoji">🙁</span><span class="pie">No le gusta</span>' },
  ]) {
    const btn = el('button', 'opcion', op.t, { type: 'button' });

    btn.addEventListener('click', () => {
      if (btn.classList.contains('bloqueada')) return;
      [...opciones.children].forEach((o) => o.classList.add('bloqueada'));

      const acerto = op.v === linea.gusta;
      btn.classList.add(acerto ? 'correcta' : 'errada');
      // Dos opciones: si se equivoco, la otra es la correcta. Se marca en verde.
      if (!acerto) {
        [...opciones.children].find((o) => o !== btn)?.classList.add('correcta');
      }

      ctx.responder({
        acerto,
        palabra: 'like-dislike',
        mensajeBien: uno(AVISOS.bien),
        mensajeMal: `Decía: <b>${frase}</b>`,
        pista: linea.gusta
          ? 'Cuando SÍ le gusta se dice <b>likes</b>. Cuando no, aparece <b>doesn\'t</b> '
          + 'antes del verbo.'
          : 'Escucha la palabra <b>doesn\'t</b> antes del verbo: eso significa que NO '
          + 'le gusta.',
      });
    });
    opciones.append(btn);
  }
  ctx.zonaJuego.append(opciones);
}

/* ---------- Formato C: he o she ---------- */
function montarQuienEs(ctx, linea) {
  const frase = fraseGusto(linea.persona, linea.comida, linea.gusta);

  ctx.pedir({
    instruccion: 'Escucha. ¿Habla de él o de ella?',
    textoIngles: frase,
    mostrar: false,
  });

  const opciones = el('div', 'opciones dos');
  for (const id of ['he', 'she']) {
    const p = persona(id);
    const btn = el('button', 'opcion',
      `<span class="emoji">${id === 'he' ? '👦' : '👧'}</span>`
      + `<span class="pie">${p.sujeto} (${p.es})</span>`,
      { type: 'button', 'data-id': id });

    btn.addEventListener('click', () => {
      if (btn.classList.contains('bloqueada')) return;
      [...opciones.children].forEach((o) => o.classList.add('bloqueada'));

      const acerto = id === linea.persona;
      btn.classList.add(acerto ? 'correcta' : 'errada');
      if (!acerto) opciones.querySelector(`[data-id="${linea.persona}"]`)?.classList.add('correcta');

      ctx.responder({
        acerto,
        palabra: 'tercera-persona',
        mensajeBien: uno(AVISOS.bien),
        mensajeMal: `Decía: <b>${frase}</b>`,
        pista: pistaTerceraPersona(linea.persona, linea.gusta),
      });
    });
    opciones.append(btn);
  }
  ctx.zonaJuego.append(opciones);
}
