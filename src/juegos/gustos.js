/**
 * ZONA 4 — Likes and dislikes (Leccion 3, p.40)
 *
 * ESTA ES LA ZONA QUE MAS IMPORTA. Ataca el error real de Marina, documentado
 * en su libro: escribio `He likes PIZZA` bien y, en la linea siguiente,
 * `He like YOGURT`. La -s de tercera persona la pone y la quita sin estabilidad.
 *
 * Los cuatro formatos giran todos alrededor de esa regla:
 *   A. Completar: He ____ pizza. (likes / like)
 *   B. Afirmativo vs negativo: donde va la -s y donde NO va.
 *   C. La frase entera esta bien o mal escrita.
 *   D. Traducir del espanol.
 *
 * El formato C existe por una razon concreta: en la prueba va a VER frases y
 * tiene que reconocer si estan bien. Elegir entre dos opciones no es lo mismo
 * que detectar el error en una frase escrita.
 */

import {
  PERSONAS, persona, CUMPLEANOS, COMIDAS, fraseGusto,
  pistaTerceraPersona, AVISOS,
} from '../datos.js';
import { el, barajar, uno, bolsa } from '../util.js';
import { correrZona } from '../motor.js';

/* Ocho preguntas, no doce: los cuatro formatos dos veces. Doce era largo para
   7 anos, y la regla se practica igual con ocho frases distintas. */
const GUION = ['completar', 'bienomal', 'afirmneg', 'traducir',
               'completar', 'bienomal', 'afirmneg', 'traducir'];

/* Comidas que suenan bien en estas frases, sin repetir (yoghurt y crisps
   estan en las dos listas). */
const COMIDAS_FRASE = [...new Set([...CUMPLEANOS, ...COMIDAS]
  .filter((c) => c.esComida !== false)
  .map((c) => c.en))];

export function jugarGustos({ zona, onSalir, onFin, modo }) {
  // Cada pregunta usa una comida distinta: la frase nunca se repite.
  const sacarComida = bolsa(COMIDAS_FRASE);

  correrZona({
    zona,
    total: GUION.length,
    onSalir,
    onFin,
    modo,
    montar(ctx, i) {
      const comida = sacarComida();
      switch (GUION[i]) {
        case 'completar': return montarCompletar(ctx, comida);
        case 'bienomal': return montarBienOMal(ctx, comida);
        case 'afirmneg': return montarAfirmativoNegativo(ctx, comida);
        case 'traducir': return montarTraducir(ctx, comida);
        default: throw new Error(`Formato desconocido: ${GUION[i]}`);
      }
    },
  });
}

/* ---------- Formato A: completar el verbo ---------- */
function montarCompletar(ctx, comida) {
  const quien = uno(PERSONAS);
  const gusta = Math.random() < 0.6;
  const correcta = gusta ? quien.verbo : quien.negativo;

  ctx.pedir({
    instruccion: 'Completa la frase',
    textoIngles: fraseGusto(quien.id, comida, gusta),
    mostrar: false,
  });

  const hueco = el('div', 'frase-hueco',
    `<b>${quien.sujeto}</b> <span class="hueco">?</span> <b>${comida}</b>.`);
  ctx.zonaJuego.append(hueco);

  // Normal: tres alternativas — la correcta, la contraria (gusta / no gusta)
  // y la de la otra persona con el mismo sentido, que es el error de Marina
  // ("He like"). Dificil: las cuatro formas.
  const esYo = quien.id === 'I';
  const opuesta = gusta ? quien.negativo : quien.verbo;
  const otraPersona = gusta
    ? (esYo ? 'likes' : 'like')
    : (esYo ? "doesn't like" : "don't like");
  const cuarta = gusta
    ? (esYo ? "doesn't like" : "don't like")
    : (esYo ? 'likes' : 'like');
  const todas = [correcta, opuesta, otraPersona, cuarta].slice(0, ctx.opciones);

  const opciones = el('div', 'opciones dos');
  for (const texto of barajar(todas)) {
    const btn = el('button', 'opcion solo-texto', texto,
      { type: 'button', 'data-v': texto });

    btn.addEventListener('click', () => {
      if (btn.classList.contains('bloqueada')) return;
      [...opciones.children].forEach((o) => o.classList.add('bloqueada'));

      const acerto = texto === correcta;
      btn.classList.add(acerto ? 'correcta' : 'errada');
      if (!acerto) opciones.querySelector(`[data-v="${correcta}"]`)?.classList.add('correcta');

      ctx.responder({
        acerto,
        palabra: 'tercera-persona',
        mensajeBien: uno(AVISOS.bien),
        mensajeMal: `Era: <b>${quien.sujeto} ${correcta} ${comida}.</b>`,
        pista: pistaTerceraPersona(quien.id, gusta),
      });
    });
    opciones.append(btn);
  }
  ctx.zonaJuego.append(opciones);
}

/* ---------- Formato B: esta frase esta bien o mal escrita ----------
   El formato mas cercano a lo que le van a pedir en la prueba.            */
function montarBienOMal(ctx, comida) {
  const quien = uno(PERSONAS.filter((p) => p.id !== 'I'));
  const gusta = Math.random() < 0.5;
  const mostrarMala = Math.random() < 0.5;

  // Los dos errores tipicos, que son LOS DE MARINA:
  //   - afirmativo sin -s:  "He like pizza"
  //   - negativo con -s:    "He doesn't likes pizza"
  const buena = fraseGusto(quien.id, comida, gusta);
  const mala = gusta
    ? `${quien.sujeto} like ${comida}.`
    : `${quien.sujeto} ${quien.negativo}s ${comida}.`;

  const frase = mostrarMala ? mala : buena;

  ctx.pedir({
    instruccion: '¿Está bien escrita esta frase?',
    textoIngles: buena,
    mostrar: false,
  });

  ctx.zonaJuego.append(el('div', 'frase-examen', frase));

  const opciones = el('div', 'opciones dos');
  for (const op of [
    { v: true, t: '✅ Está bien' },
    { v: false, t: '❌ Está mal' },
  ]) {
    const btn = el('button', 'opcion solo-texto', op.t, { type: 'button' });

    btn.addEventListener('click', () => {
      if (btn.classList.contains('bloqueada')) return;
      [...opciones.children].forEach((o) => o.classList.add('bloqueada'));

      const acerto = op.v === !mostrarMala;
      btn.classList.add(acerto ? 'correcta' : 'errada');
      // Dos opciones: si se equivoco, la otra es la correcta. Se marca en verde.
      if (!acerto) {
        [...opciones.children].find((o) => o !== btn)?.classList.add('correcta');
      }

      ctx.responder({
        acerto,
        palabra: 'tercera-persona',
        mensajeBien: uno(AVISOS.bien),
        mensajeMal: mostrarMala
          ? `Estaba mal. Lo correcto es: <b>${buena}</b>`
          : 'Estaba bien escrita.',
        pista: mostrarMala
          ? (gusta
            ? `Con <b>${quien.sujeto}</b> el verbo lleva <b>-s</b>: <b>like<u>s</u></b>.`
            : `Después de <b>doesn't</b> el verbo va <b>sin -s</b>: `
            + `<b>${quien.sujeto} doesn't like</b>.`)
          : pistaTerceraPersona(quien.id, gusta),
      });
    });
    opciones.append(btn);
  }
  ctx.zonaJuego.append(opciones);
}

/* ---------- Formato C: afirmativo vs negativo ---------- */
function montarAfirmativoNegativo(ctx, comida) {
  const quien = uno(PERSONAS);
  const gusta = Math.random() < 0.5;
  const frase = fraseGusto(quien.id, comida, gusta);

  ctx.pedir({
    // Con "I" no se puede armar "a yo le gusta": se le pregunta a ella.
    instruccion: quien.id === 'I'
      ? (gusta
        ? `¿Cómo dices que a ti te gusta ${comida}?`
        : `¿Cómo dices que a ti NO te gusta ${comida}?`)
      : (gusta
        ? `¿Cómo se dice que a ${quien.es} le gusta ${comida}?`
        : `¿Cómo se dice que a ${quien.es} NO le gusta ${comida}?`),
    textoIngles: frase,
    mostrar: false,
  });

  const cartas = barajar([
    { texto: fraseGusto(quien.id, comida, gusta), ok: true },
    { texto: fraseGusto(quien.id, comida, !gusta), ok: false },
    {
      // La forma mal escrita: el error de Marina como distractor.
      texto: gusta
        ? `${quien.sujeto} ${quien.id === 'I' ? 'likes' : 'like'} ${comida}.`
        : `${quien.sujeto} ${quien.negativo}s ${comida}.`,
      ok: false,
    },
  ]);

  const opciones = el('div', 'opciones lista');
  for (const c of cartas) {
    const btn = el('button', 'opcion solo-texto', c.texto, { type: 'button' });

    btn.addEventListener('click', () => {
      if (btn.classList.contains('bloqueada')) return;
      [...opciones.children].forEach((o) => o.classList.add('bloqueada'));

      btn.classList.add(c.ok ? 'correcta' : 'errada');
      if (!c.ok) {
        [...opciones.children].find((o) => o.textContent === frase)
          ?.classList.add('correcta');
      }

      ctx.responder({
        acerto: c.ok,
        palabra: 'tercera-persona',
        mensajeBien: uno(AVISOS.bien),
        mensajeMal: `Era: <b>${frase}</b>`,
        pista: pistaTerceraPersona(quien.id, gusta),
      });
    });
    opciones.append(btn);
  }
  ctx.zonaJuego.append(opciones);
}

/* ---------- Formato D: traducir del espanol ---------- */
function montarTraducir(ctx, comida) {
  const quien = uno(PERSONAS);
  const gusta = Math.random() < 0.5;
  const frase = fraseGusto(quien.id, comida, gusta);

  const enEspanol = quien.id === 'I'
    ? (gusta ? `Me gusta ${comida}` : `No me gusta ${comida}`)
    : (gusta
      ? `A ${quien.es} le gusta ${comida}`
      : `A ${quien.es} no le gusta ${comida}`);

  ctx.pedir({
    instruccion: `"${enEspanol}". ¿Cómo se dice en inglés?`,
    textoIngles: frase,
    mostrar: false,
  });

  const otra = uno(PERSONAS.filter((p) => p.id !== quien.id));
  const cartas = barajar([
    { texto: frase, ok: true },
    { texto: fraseGusto(quien.id, comida, !gusta), ok: false },
    { texto: fraseGusto(otra.id, comida, gusta), ok: false },
  ]);

  const opciones = el('div', 'opciones lista');
  for (const c of cartas) {
    const btn = el('button', 'opcion solo-texto', c.texto, { type: 'button' });

    btn.addEventListener('click', () => {
      if (btn.classList.contains('bloqueada')) return;
      [...opciones.children].forEach((o) => o.classList.add('bloqueada'));

      btn.classList.add(c.ok ? 'correcta' : 'errada');
      if (!c.ok) {
        [...opciones.children].find((o) => o.textContent === frase)
          ?.classList.add('correcta');
      }

      ctx.responder({
        acerto: c.ok,
        palabra: 'like-dislike',
        mensajeBien: uno(AVISOS.bien),
        mensajeMal: `Era: <b>${frase}</b>`,
        pista: pistaTerceraPersona(quien.id, gusta),
      });
    });
    opciones.append(btn);
  }
  ctx.zonaJuego.append(opciones);
}
