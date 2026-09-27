/**
 * ZONA 2 — Our food (Leccion 1, pp. 44-45)
 *
 * El vocabulario que faltaba hasta el 27-09, con su clasificacion. El ejercicio
 * de la p.45 pide justamente eso: "Food from animals" o "Food from plants".
 *
 * Incluye tambien los ingredientes de la olla (p.42), porque el punto 2 del
 * temario dice "vocabulario de diferentes comidas" y son las dos listas.
 *
 * Tres formatos:
 *   A. De donde viene esta comida: animals o plants.
 *   B. Suena la palabra → elige la imagen.
 *   C. De estas tres, cual es food from animals/plants.
 */

import { COMIDAS, OLLA, ORIGENES, pistaDeError, AVISOS } from '../datos.js';
import { el, barajar, uno, elegirCon } from '../util.js';
import { imagen } from '../dibujos.js';
import { correrZona } from '../motor.js';

const TOTAL = 10;

export function jugarComidas({ zona, onSalir, onFin, modo }) {
  let bolsa = [];
  const sacar = () => {
    if (!bolsa.length) bolsa = barajar(COMIDAS);
    return bolsa.pop();
  };

  correrZona({
    zona,
    total: TOTAL,
    onSalir,
    onFin,
    modo,
    montar(ctx, i) {
      if (i === 3 || i === 8) montarOlla(ctx);
      else if (i % 3 === 1) montarEscucha(ctx, sacar());
      else if (i % 3 === 2) montarCualEs(ctx);
      else montarDeDondeViene(ctx, sacar());
    },
  });
}

/* ---------- Formato A: animals o plants ---------- */
function montarDeDondeViene(ctx, c) {
  ctx.pedir({
    instruccion: `${c.en} — ¿de dónde viene?`,
    textoIngles: c.en,
    apoyo: 'Food from animals: viene de un animal · Food from plants: de una planta.',
  });

  const tarjeta = el('div', 'tarjeta-emoji', imagen(c, true));
  ctx.zonaJuego.append(tarjeta);

  const opciones = el('div', 'opciones dos');
  for (const id of ['animals', 'plants']) {
    const btn = el('button', 'opcion solo-texto',
      `${id === 'animals' ? '🐄' : '🌱'} ${ORIGENES[id].en}`,
      { type: 'button', 'data-de': id });

    btn.addEventListener('click', () => {
      if (btn.classList.contains('bloqueada')) return;
      [...opciones.children].forEach((o) => o.classList.add('bloqueada'));

      const acerto = id === c.de;
      btn.classList.add(acerto ? 'correcta' : 'errada');
      if (!acerto) opciones.querySelector(`[data-de="${c.de}"]`)?.classList.add('correcta');

      ctx.responder({
        acerto,
        palabra: c.de === 'animals' ? 'food-animals' : 'food-plants',
        mensajeBien: uno(AVISOS.bien),
        mensajeMal: `${c.en} es <b>${ORIGENES[c.de].en}</b>.`,
        pista: c.de === 'animals'
          ? `<b>${c.es}</b> viene de un animal: por eso es <i>food from animals</i>.`
          : `<b>${c.es}</b> viene de una planta: por eso es <i>food from plants</i>.`,
      });
    });
    opciones.append(btn);
  }
  ctx.zonaJuego.append(opciones);
}

/* ---------- Formato B: suena la palabra ---------- */
function montarEscucha(ctx, c) {
  ctx.pedir({
    instruccion: 'Escucha y toca la imagen correcta',
    textoIngles: c.en,
  });

  const cartas = barajar(elegirCon(COMIDAS, c, 3));
  const opciones = el('div', 'opciones tres');

  for (const x of cartas) {
    const btn = el('button', 'opcion',
      imagen(x),
      { type: 'button', 'data-en': x.en, 'aria-label': x.es });

    btn.addEventListener('click', () => {
      if (btn.classList.contains('bloqueada')) return;
      [...opciones.children].forEach((o) => o.classList.add('bloqueada'));

      const acerto = x.en === c.en;
      btn.classList.add(acerto ? 'correcta' : 'errada');
      if (!acerto) opciones.querySelector(`[data-en="${c.en}"]`)?.classList.add('correcta');

      ctx.responder({
        acerto,
        palabra: c.en,
        mensajeBien: uno(AVISOS.bien),
        mensajeMal: `Era <b>${c.en}</b> (${c.es}).`,
        pista: pistaDeError(x.en, c.en),
      });
    });
    opciones.append(btn);
  }
  ctx.zonaJuego.append(opciones);
}

/* ---------- Formato C: cual de estas es food from... ---------- */
function montarCualEs(ctx) {
  const grupo = uno(['animals', 'plants']);
  const correcta = uno(COMIDAS.filter((c) => c.de === grupo));
  const otras = barajar(COMIDAS.filter((c) => c.de !== grupo)).slice(0, 2);
  const cartas = barajar([correcta, ...otras]);

  ctx.pedir({
    instruccion: `¿Cuál de estas es ${ORIGENES[grupo].en}?`,
    textoIngles: ORIGENES[grupo].en,
  });

  const opciones = el('div', 'opciones tres');
  for (const c of cartas) {
    const btn = el('button', 'opcion',
      `${imagen(c)}<span class="pie">${c.en}</span>`,
      { type: 'button', 'data-en': c.en });

    btn.addEventListener('click', () => {
      if (btn.classList.contains('bloqueada')) return;
      [...opciones.children].forEach((o) => o.classList.add('bloqueada'));

      const acerto = c.de === grupo;
      btn.classList.add(acerto ? 'correcta' : 'errada');
      if (!acerto) opciones.querySelector(`[data-en="${correcta.en}"]`)?.classList.add('correcta');

      ctx.responder({
        acerto,
        palabra: grupo === 'animals' ? 'food-animals' : 'food-plants',
        mensajeBien: uno(AVISOS.bien),
        mensajeMal: `<b>${correcta.en}</b> es ${ORIGENES[grupo].en}.`,
        pista: `${c.en} viene de ${c.de === 'animals' ? 'un animal' : 'una planta'}.`,
      });
    });
    opciones.append(btn);
  }
  ctx.zonaJuego.append(opciones);
}

/* ---------- Los ingredientes de la olla (p.42) ----------
   Aqui esta `potatoes`, el unico plural con -es de la unidad, y `a pot`, que
   es el unico con articulo.                                                 */
function montarOlla(ctx) {
  const c = uno(OLLA);

  ctx.pedir({
    instruccion: 'Escucha: ¿cuál es?',
    textoIngles: c.en,
    apoyo: 'Son los ingredientes de la olla: mushrooms, onions, potatoes, a pot.',
  });

  const cartas = barajar(OLLA);
  const opciones = el('div', 'opciones cuatro');

  for (const x of cartas) {
    const btn = el('button', 'opcion',
      `${imagen(x)}<span class="pie">${x.en}</span>`,
      { type: 'button', 'data-en': x.en });

    btn.addEventListener('click', () => {
      if (btn.classList.contains('bloqueada')) return;
      [...opciones.children].forEach((o) => o.classList.add('bloqueada'));

      const acerto = x.en === c.en;
      btn.classList.add(acerto ? 'correcta' : 'errada');
      if (!acerto) opciones.querySelector(`[data-en="${c.en}"]`)?.classList.add('correcta');

      ctx.responder({
        acerto,
        palabra: c.en,
        mensajeBien: uno(AVISOS.bien),
        mensajeMal: `Era <b>${c.en}</b> (${c.es}).`,
        pista: pistaDeError(x.en, c.en),
      });
    });
    opciones.append(btn);
  }
  ctx.zonaJuego.append(opciones);
}
