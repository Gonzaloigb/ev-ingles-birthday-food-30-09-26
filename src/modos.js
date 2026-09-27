/**
 * modos.js — los dos modos de juego.
 *
 * Existe como archivo aparte, y no como un par de constantes dentro del motor,
 * porque el mapa tambien necesita leerlos (para pintar el selector) y porque es
 * la pieza que se copia tal cual a los otros juegos del proyecto.
 *
 * La regla que manda: el modo dificil NUNCA esconde materia nueva. Solo quita
 * ayudas. Si algo solo se aprende jugando en dificil, esta mal puesto.
 */

import { leerModo, guardarModo } from './estado.js';

export const MODOS = {
  normal: {
    id: 'normal',
    nombre: '🌱 Normal',
    resumen: 'Para aprender',
    desc: 'Tres alternativas, y cuando te equivocas te explico por qué.',
    opciones: 3,   // cuantas alternativas ofrece una pregunta de seleccion
    ayuda: true,   // muestra el texto de apoyo y la pista del error
    vidas: 0,      // 0 = sin limite de errores
  },
  dificil: {
    id: 'dificil',
    nombre: '🔥 Difícil',
    resumen: 'Para medirte',
    desc: 'Todas las alternativas, sin pistas y con 3 vidas ❤️. Si las pierdes, la zona vuelve a empezar.',
    opciones: 4,
    ayuda: false,
    vidas: 3,
  },
};

/** El modo pedido, el guardado, o normal. Nunca devuelve undefined. */
export function modo(id) {
  return MODOS[id] || MODOS[leerModo()] || MODOS.normal;
}

/** Cambia el modo activo y lo deja guardado. */
export function elegirModo(id) {
  if (!MODOS[id]) throw new Error(`Modo desconocido: ${id}`);
  guardarModo(id);
  return MODOS[id];
}

export { leerModo };
