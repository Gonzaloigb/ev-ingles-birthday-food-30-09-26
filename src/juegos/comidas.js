/**
 * ZONA 2 — Our food (Leccion 1, pp. 44-45)
 *
 * El vocabulario que faltaba hasta el 27-09, con su clasificacion. El ejercicio
 * de la p.45 pide justamente eso: "Food from animals" o "Food from plants".
 *
 * Incluye tambien los ingredientes de la olla (p.42), porque el punto 2 del
 * temario dice "vocabulario de diferentes comidas" y son las dos listas.
 *
 * Cinco formatos:
 *   A. De donde viene esta comida: animals o plants.
 *   B. Suena la palabra → elige la imagen.
 *   C. De estas tres, cual es food from animals/plants.
 *   D. Los ingredientes de la olla (p.42).
 *   E. Have you got…? con la bolsa (p.42).
 *
 * Ocho preguntas, cada formato con su bolsa: ninguna se repite en la vuelta.
 */

import { COMIDAS, OLLA, ORIGENES, HAVE_YOU_GOT, pistaDeError, AVISOS } from '../datos.js';
import { el, barajar, uno, elegirCon, imagen, bolsa } from '../util.js';
import { correrZona } from '../motor.js';

const GUION = ['origen', 'escucha', 'cual', 'olla', 'origen', 'escucha', 'haveyougot', 'origen'];

export function jugarComidas({ zona, onSalir, onFin, modo }) {
  const sacarOrigen = bolsa(COMIDAS);
  const sacarEscucha = bolsa(COMIDAS);
  const sacarOlla = bolsa(OLLA);
  const sacarPregunta = bolsa(OLLA);

  correrZona({
    zona,
    total: GUION.length,
    onSalir,
    onFin,
    modo,
    montar(ctx, i) {
      switch (GUION[i]) {
        case 'origen': return montarDeDondeViene(ctx, sacarOrigen());
        case 'escucha': return montarEscucha(ctx, sacarEscucha());
        case 'cual': return montarCualEs(ctx);
        case 'olla': return montarOlla(ctx, sacarOlla());
        case 'haveyougot': return montarHaveYouGot(ctx, sacarPregunta());
        default: throw new Error(`Formato desconocido: ${GUION[i]}`);
      }
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
function montarOlla(ctx, c) {
  ctx.pedir({
    instruccion: 'Escucha: ¿cuál es?',
    textoIngles: c.en,
    apoyo: 'Son los ingredientes de la olla: mushrooms, onions, potatoes, a pot.',
  });

  // Normal: tres alternativas. Dificil: las cuatro.
  const cartas = elegirCon(OLLA, c, ctx.opciones);
  const opciones = el('div', `opciones ${cartas.length === 4 ? 'cuatro' : 'tres'}`);

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

/* ---------- Have you got…? con la bolsa (p.42) ----------
   El ejercicio del libro: dibujar dos cosas en la bolsa y responder
   "Have you got onions?" con Yes, I have / No, I haven't.

   Es el punto 3 del temario. Marina ya lo domina (lo escribio bien 4 veces),
   por eso sale UNA vez por vuelta y no tiene zona propia. Pero tiene que
   estar: si solo apareciera en el ensayo, el ensayo mediria algo que ninguna
   zona practica.                                                            */
function montarHaveYouGot(ctx, c) {
  const loTiene = Math.random() < 0.5;
  const otros = barajar(OLLA.filter((x) => x !== c));
  const enBolsa = loTiene ? barajar([c, otros[0]]) : otros.slice(0, 2);
  const correcta = loTiene ? HAVE_YOU_GOT.si : HAVE_YOU_GOT.no;

  ctx.pedir({
    instruccion: 'Mira tu bolsa y responde',
    textoIngles: HAVE_YOU_GOT.pregunta(c.en),
    apoyo: "Si está en la bolsa: Yes, I have. Si no está: No, I haven't.",
  });

  ctx.zonaJuego.append(el('div', 'tarjeta-emoji bolsa',
    `<span class="emoji">🛍️</span>${enBolsa.map((x) => imagen(x)).join('')}`));

  const opciones = el('div', 'opciones dos');
  for (const texto of [HAVE_YOU_GOT.si, HAVE_YOU_GOT.no]) {
    const btn = el('button', 'opcion solo-texto', texto, { type: 'button' });

    btn.addEventListener('click', () => {
      if (btn.classList.contains('bloqueada')) return;
      [...opciones.children].forEach((o) => o.classList.add('bloqueada'));

      const acerto = texto === correcta;
      btn.classList.add(acerto ? 'correcta' : 'errada');
      if (!acerto) {
        [...opciones.children].find((o) => o !== btn)?.classList.add('correcta');
      }

      ctx.responder({
        acerto,
        palabra: 'have-you-got',
        mensajeBien: uno(AVISOS.bien),
        mensajeMal: `Era: <b>${correcta}</b>`,
        pista: loTiene
          ? `<b>${c.en}</b> está en la bolsa: <b>${HAVE_YOU_GOT.si}</b>`
          : `<b>${c.en}</b> no está en la bolsa: <b>${HAVE_YOU_GOT.no}</b>`,
      });
    });
    opciones.append(btn);
  }
  ctx.zonaJuego.append(opciones);
}
