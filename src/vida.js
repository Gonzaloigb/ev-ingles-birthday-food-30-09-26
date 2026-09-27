/**
 * vida.js — la mascota, la racha y las animaciones de respuesta.
 *
 * Es lo que separa un juego que funciona de uno que engancha. Nada de esto
 * cambia lo que se pregunta ni lo que se evalua: solo como se siente.
 *
 * Tres piezas, todas opcionales para el motor:
 *
 *   1. MASCOTA — acompana, celebra y se preocupa. El juego de ingles de agosto
 *      tenia una; ciencias y matematica la perdieron al copiar el motor. Sin
 *      ella la pantalla es correcta pero fria.
 *
 *   2. RACHA — cuenta aciertos seguidos. A partir de 3 aparece con fuego. Es el
 *      unico marcador que premia la CONSTANCIA y no el resultado final: se
 *      puede ir mal en la zona y aun asi encadenar tres buenas.
 *
 *   3. ANIMACIONES — el salto al acertar y el temblor al fallar. Son el acuse
 *      de recibo: sin ellos el unico aviso de que el toque se registro es que
 *      el color cambio.
 *
 * TODO respeta `prefers-reduced-motion`: el CSS apaga las animaciones y el
 * juego sigue funcionando igual, solo que quieto.
 *
 * Este archivo se copia tal cual a los otros juegos del proyecto. No debe
 * contener nada de una asignatura en particular.
 */

import { el } from './util.js';

/* =========================================================================
   1. LA MASCOTA
   ========================================================================= */

/**
 * Caras de la mascota. Son SVG y no emoji a proposito: un emoji de cara se ve
 * distinto en cada telefono, y esta es la pieza que da identidad al juego.
 */
const CARAS = {
  normal: `
    <circle cx="50" cy="50" r="34" class="cara"/>
    <circle cx="39" cy="44" r="4.5" class="ojo"/>
    <circle cx="61" cy="44" r="4.5" class="ojo"/>
    <path d="M40 60 q10 8 20 0" class="boca"/>`,
  feliz: `
    <circle cx="50" cy="50" r="34" class="cara"/>
    <path d="M33 43 q6-7 12 0" class="ojo-linea"/>
    <path d="M55 43 q6-7 12 0" class="ojo-linea"/>
    <path d="M36 57 q14 14 28 0 q-14 6-28 0" class="boca-llena"/>
    <circle cx="30" cy="57" r="5" class="rubor"/>
    <circle cx="70" cy="57" r="5" class="rubor"/>`,
  triste: `
    <circle cx="50" cy="50" r="34" class="cara"/>
    <circle cx="39" cy="46" r="4.5" class="ojo"/>
    <circle cx="61" cy="46" r="4.5" class="ojo"/>
    <path d="M40 64 q10-8 20 0" class="boca"/>
    <path d="M32 36 q6-4 12-1" class="ceja"/>
    <path d="M68 36 q-6-4-12-1" class="ceja"/>`,
  pensando: `
    <circle cx="50" cy="50" r="34" class="cara"/>
    <circle cx="39" cy="44" r="4.5" class="ojo"/>
    <circle cx="61" cy="44" r="4.5" class="ojo"/>
    <path d="M42 62 l16 0" class="boca"/>`,
};

/**
 * Crea la mascota.
 * @returns {{nodo: HTMLElement, reaccionar: Function, decir: Function}}
 */
export function crearMascota() {
  const nodo = el('div', 'mascota');
  const globo = el('div', 'globo');
  const cuerpo = el('div', 'mascota-cuerpo');

  const pintar = (cara) => {
    cuerpo.innerHTML =
      `<svg viewBox="0 0 100 100" class="mascota-svg" role="img" aria-hidden="true">`
      + `${CARAS[cara] || CARAS.normal}</svg>`;
  };
  pintar('normal');

  nodo.append(globo, cuerpo);

  let tiempo = null;

  /**
   * Cambia la cara y, si se le da texto, lo dice en el globo.
   * Vuelve sola a la cara normal despues de un rato.
   */
  function reaccionar(cara, texto = '', ms = 1800) {
    pintar(cara);
    cuerpo.classList.remove('salta', 'tiembla');
    // Forzar reflow para poder relanzar la misma animacion.
    void cuerpo.offsetWidth;
    if (cara === 'feliz') cuerpo.classList.add('salta');
    if (cara === 'triste') cuerpo.classList.add('tiembla');

    if (texto) {
      globo.textContent = texto;
      globo.classList.add('visible');
    }

    clearTimeout(tiempo);
    tiempo = setTimeout(() => {
      pintar('normal');
      cuerpo.classList.remove('salta', 'tiembla');
      globo.classList.remove('visible');
    }, ms);
  }

  /** Solo el globo, sin cambiar la cara. */
  function decir(texto, ms = 2200) {
    globo.textContent = texto;
    globo.classList.add('visible');
    clearTimeout(tiempo);
    tiempo = setTimeout(() => globo.classList.remove('visible'), ms);
  }

  return { nodo, reaccionar, decir };
}

/* =========================================================================
   2. LA RACHA
   ========================================================================= */

/** Que se muestra segun cuantas seguidas lleve. */
const NIVELES = [
  { desde: 3, icono: '🔥', clase: 'r1' },
  { desde: 5, icono: '🔥🔥', clase: 'r2' },
  { desde: 8, icono: '🔥🔥🔥', clase: 'r3' },
];

/**
 * Contador de aciertos seguidos.
 *
 * Aparece recien en la tercera: antes seria ruido, y ademas "2 seguidas" no es
 * un logro. Al fallar desaparece sin drama — no se penaliza, solo se reinicia.
 *
 * @returns {{nodo, sumar, romper, cuenta, mejor}}
 */
export function crearRacha() {
  const nodo = el('div', 'racha');
  let cuenta = 0;
  let mejor = 0;

  function pintar() {
    const nivel = [...NIVELES].reverse().find((n) => cuenta >= n.desde);
    if (!nivel) {
      nodo.className = 'racha';
      nodo.textContent = '';
      return;
    }
    nodo.className = `racha visible ${nivel.clase}`;
    nodo.innerHTML = `<span class="llama">${nivel.icono}</span> ${cuenta} seguidas`;
  }

  return {
    nodo,
    /** Un acierto mas. Devuelve true si acaba de alcanzar un nivel nuevo. */
    sumar() {
      cuenta += 1;
      if (cuenta > mejor) mejor = cuenta;
      const subio = NIVELES.some((n) => n.desde === cuenta);
      pintar();
      if (subio) {
        nodo.classList.remove('crece');
        void nodo.offsetWidth;
        nodo.classList.add('crece');
      }
      return subio;
    },
    /** Se corto la racha. */
    romper() {
      cuenta = 0;
      pintar();
    },
    cuenta: () => cuenta,
    mejor: () => mejor,
  };
}

/* =========================================================================
   3. ANIMACIONES DE RESPUESTA
   ========================================================================= */

/**
 * Marca visualmente el boton respondido.
 *
 * Es el acuse de recibo del toque. Sin esto, el unico aviso de que el juego
 * registro la respuesta es el cambio de color, que en un telefono con el dedo
 * encima no siempre se ve.
 */
export function animarRespuesta(nodo, acerto) {
  if (!nodo) return;
  nodo.classList.remove('anim-bien', 'anim-mal');
  void nodo.offsetWidth;
  nodo.classList.add(acerto ? 'anim-bien' : 'anim-mal');
}

/** Frases de la mascota. Cortas: se leen de reojo, mientras se juega. */
export const FRASES = {
  bien: ['¡Bien!', '¡Esa es!', '¡Genial!', '¡Perfecto!'],
  mal: ['Casi…', 'Otra vez', 'Tú puedes'],
  racha3: ['¡3 seguidas!', '¡Vas volando!'],
  racha5: ['¡5 seguidas!', '¡Increíble!'],
  racha8: ['¡8 seguidas!', '¡Eres una máquina!'],
};
