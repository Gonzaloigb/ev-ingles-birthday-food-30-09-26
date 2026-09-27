/**
 * ZONA 1 — Birthday food (Leccion 1, p.38)
 *
 * Las 8 palabras del cumpleanos. La prueba es auditiva, asi que el audio va
 * primero y el texto escrito es apoyo, no al reves.
 *
 * Dos formatos:
 *   A. Suena la palabra → cual de estas imagenes es.
 *   B. Se ve la imagen → cual de estas palabras es. Al reves, para fijar la
 *      forma escrita, que es donde Marina falla.
 */

import { CUMPLEANOS, pistaDeError, AVISOS } from '../datos.js';
import { el, barajar, uno, elegirCon } from '../util.js';
import { correrZona } from '../motor.js';

const TOTAL = 10;

export function jugarVocabulario({ zona, onSalir, onFin, modo }) {
  let bolsa = [];
  const sacar = () => {
    if (!bolsa.length) bolsa = barajar(CUMPLEANOS);
    return bolsa.pop();
  };

  correrZona({
    zona,
    total: TOTAL,
    onSalir,
    onFin,
    modo,
    montar(ctx, i) {
      if (i % 2 === 0) montarEscuchaYElige(ctx, sacar());
      else montarVeYElige(ctx, sacar());
    },
  });
}

/* ---------- Formato A: suena la palabra, elige la imagen ---------- */
function montarEscuchaYElige(ctx, p) {
  ctx.pedir({
    instruccion: 'Escucha y toca la imagen correcta',
    textoIngles: p.en,
  });

  const cartas = barajar(elegirCon(CUMPLEANOS, p, ctx.opciones === 4 ? 4 : 3));
  const opciones = el('div', `opciones ${cartas.length === 4 ? 'cuatro' : 'tres'}`);

  for (const c of cartas) {
    const btn = el('button', 'opcion',
      `<span class="emoji">${c.emoji}</span>`,
      { type: 'button', 'data-en': c.en, 'aria-label': c.es });

    btn.addEventListener('click', () => {
      if (btn.classList.contains('bloqueada')) return;
      [...opciones.children].forEach((o) => o.classList.add('bloqueada'));

      const acerto = c.en === p.en;
      btn.classList.add(acerto ? 'correcta' : 'errada');
      // Al fallar, mostrar cual era: aprender, no solo saber que fallo.
      if (!acerto) opciones.querySelector(`[data-en="${p.en}"]`)?.classList.add('correcta');

      ctx.responder({
        acerto,
        palabra: p.en,
        mensajeBien: uno(AVISOS.bien),
        mensajeMal: `Era <b>${p.en}</b> (${p.es}).`,
        pista: pistaDeError(c.en, p.en),
      });
    });
    opciones.append(btn);
  }
  ctx.zonaJuego.append(opciones);
}

/* ---------- Formato B: ve la imagen, elige la palabra escrita ---------- */
function montarVeYElige(ctx, p) {
  ctx.pedir({
    instruccion: '¿Cómo se escribe?',
    textoIngles: p.en,
  });

  const tarjeta = el('div', 'tarjeta-emoji', `<span class="emoji grande">${p.emoji}</span>`);
  ctx.zonaJuego.append(tarjeta);

  const cartas = barajar(elegirCon(CUMPLEANOS, p, 3));
  const opciones = el('div', 'opciones tres');

  for (const c of cartas) {
    const btn = el('button', 'opcion solo-texto', c.en,
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
        mensajeMal: `Era <b>${p.en}</b>.`,
        pista: pistaDeError(c.en, p.en),
      });
    });
    opciones.append(btn);
  }
  ctx.zonaJuego.append(opciones);
}
