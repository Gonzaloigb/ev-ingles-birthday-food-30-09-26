/**
 * datos.js — el contenido de la unidad, como datos.
 *
 * REGLA QUE MANDA: ningun texto en ingles debe escribirse dentro de la logica de
 * un minijuego. Se declara aqui y desde aqui se consume. Cambiar una palabra =
 * cambiar una linea. Se refleja de `CONTENIDOS.md`.
 *
 * Unidad 5 de Learn with Us 2: "It's my birthday!" (pp. 38-45).
 *
 * EL INSUMO QUE MANDA SOBRE EL DISENO: los errores reales de Marina, extraidos
 * de su libro trabajado (13 fotos, 27-09-2026). No son conjeturas.
 *
 *   - Escribio `He likes PIZZA` bien y, en la linea siguiente, `He like YOGURT`.
 *     La -s de tercera persona la pone y la quita sin estabilidad. Es el mismo
 *     patron de la Unidad 4 (`sheeps` con -s de mas, `5 goat` con -s de menos).
 *   - `crisps` lo escribio de 4 formas distintas, ninguna correcta.
 *   - `yoghurt` 3 veces, ninguna correcta: siempre omite la `h` muda.
 *   - `Have you got` lo escribio bien 4 veces. NO hay que gastar tiempo ahi.
 */

/* =========================================================================
   1. Vocabulario de cumpleanos (Leccion 1, p.38)
   ========================================================================= */

export const CUMPLEANOS = [
  { en: 'pizza', es: 'pizza', emoji: '🍕', esComida: true },
  { en: 'sausages', es: 'salchichas', emoji: '🌭', esComida: true },
  // 🥣 y no 🍦: el helado es un DISTRACTOR del ejercicio auditivo de la p.44
  // (3a y 6a). En el libro el yogur es un pote con cuchara. Con 🍦, Marina
  // aprenderia a marcar el helado cuando escuche "yoghurt".
  { en: 'yoghurt', es: 'yogur', emoji: '🥣', esComida: true },
  { en: 'cherries', es: 'cerezas', emoji: '🍒', esComida: true },
  { en: 'popcorn', es: 'palomitas', emoji: '🍿', esComida: true },
  { en: 'crisps', es: 'papas fritas de bolsa', emoji: '🍟', esComida: true },  // no 🥔: ese es potatoes
  { en: 'water', es: 'agua', emoji: '💧', esComida: true },
  // No es comida: es el "objeto" que nombra el temario. En una frase va en
  // plural, como en la cancion: "He likes birthday cards" (p.39). Sin esto el
  // juego decia "He likes birthday card", que esta mal.
  { en: 'birthday card', enFrase: 'birthday cards', es: 'tarjeta de cumpleaños',
    emoji: '💌', esComida: false },
];

/* =========================================================================
   2a. "Our food" (Leccion 1, pp. 44-45)

   Esta lista faltaba por completo hasta el 27-09. La clasificacion
   animales/plantas ES materia: el ejercicio de la p.45 la pide.
   ========================================================================= */

export const COMIDAS = [
  { en: 'milk', es: 'leche', emoji: '🥛', de: 'animals' },
  { en: 'cheese', es: 'queso', emoji: '🧀', de: 'animals' },
  { en: 'eggs', es: 'huevos', emoji: '🥚', de: 'animals' },
  { en: 'yoghurt', es: 'yogur', emoji: '🥣', de: 'animals' },
  { en: 'apples', es: 'manzanas', emoji: '🍎', de: 'plants' },
  { en: 'bread', es: 'pan', emoji: '🍞', de: 'plants' },
  { en: 'orange juice', es: 'jugo de naranja', emoji: '🧃', de: 'plants' },
  { en: 'crisps', es: 'papas fritas de bolsa', emoji: '🍟', de: 'plants' },
];

export const ORIGENES = {
  animals: { en: 'Food from animals', es: 'Comida que viene de animales' },
  plants: { en: 'Food from plants', es: 'Comida que viene de plantas' },
};

/* =========================================================================
   2b. Los ingredientes de la olla (Leccion 6, p.42)
   ========================================================================= */

export const OLLA = [
  { en: 'mushrooms', es: 'champiñones', emoji: '🍄', esComida: true },
  { en: 'onions', es: 'cebollas', emoji: '🧅', esComida: true },
  // Unico plural con -es de la unidad.
  { en: 'potatoes', es: 'papas', emoji: '🥔', esComida: true, plural: 'es' },
  // Con articulo, porque es singular: "Have you got A POT?"
  { en: 'a pot', es: 'una olla', emoji: '🍲', esComida: false },
];

/** Todo el vocabulario junto, sin repetir. */
export const TODAS = (() => {
  const vistas = new Set();
  return [...CUMPLEANOS, ...COMIDAS, ...OLLA].filter((p) => {
    if (vistas.has(p.en)) return false;
    vistas.add(p.en);
    return true;
  });
})();

export function palabra(en) {
  const p = TODAS.find((x) => x.en === en);
  if (!p) throw new Error(`Palabra desconocida: ${en}`);
  return p;
}

/* =========================================================================
   3. Have you got…?  (Leccion 6, p.42)
   ========================================================================= */

export const HAVE_YOU_GOT = {
  pregunta: (comida) => `Have you got ${comida}?`,
  si: 'Yes, I have.',
  no: "No, I haven't.",
  // Los cuatro del libro, en orden.
  ejemplos: ['onions', 'mushrooms', 'a pot', 'potatoes'],
};

/* =========================================================================
   4. I like / I don't like  (Leccion 3, p.40)

   El corazon del juego: aqui esta el error real de Marina.
   ========================================================================= */

export const PERSONAS = [
  { id: 'I', sujeto: 'I', verbo: 'like', negativo: "don't like", es: 'yo' },
  { id: 'he', sujeto: 'He', verbo: 'likes', negativo: "doesn't like", es: 'él' },
  { id: 'she', sujeto: 'She', verbo: 'likes', negativo: "doesn't like", es: 'ella' },
];

export function persona(id) {
  const p = PERSONAS.find((x) => x.id === id);
  if (!p) throw new Error(`Persona desconocida: ${id}`);
  return p;
}

/** Arma la frase completa. `gusta` decide afirmativo o negativo. */
export function fraseGusto(personaId, comida, gusta) {
  const p = persona(personaId);
  return gusta
    ? `${p.sujeto} ${p.verbo} ${comida}.`
    : `${p.sujeto} ${p.negativo} ${comida}.`;
}

/**
 * La cancion de la p.39 — fuente literal del ejercicio auditivo.
 *
 * Corregida el 28-09-2026 contra la foto del libro: la version anterior tenia
 * cambiados cherries y crisps entre el y ella. Es "HE likes popcorn and he
 * likes CHERRIES" y "SHE likes water and she likes CRISPS". La ultima linea,
 * "We like birthdays. Yeah!", no entra: el temario no trabaja "we".
 */
export const CANCION = [
  { persona: 'he', gusta: true, comida: 'birthdays' },
  { persona: 'he', gusta: true, comida: 'birthday cards' },
  { persona: 'he', gusta: false, comida: 'crisps' },
  { persona: 'he', gusta: false, comida: 'sausages' },
  { persona: 'he', gusta: true, comida: 'popcorn' },
  { persona: 'he', gusta: true, comida: 'cherries' },
  { persona: 'she', gusta: true, comida: 'water' },
  { persona: 'she', gusta: true, comida: 'crisps' },
  { persona: 'she', gusta: false, comida: 'pizza' },
  { persona: 'she', gusta: false, comida: 'popcorn' },
  { persona: 'she', gusta: true, comida: 'yoghurt' },
  { persona: 'she', gusta: true, comida: 'birthdays' },
];

/* =========================================================================
   5. Las palabras que mas le cuestan — de su libro
   ========================================================================= */

/**
 * Prioridad de practica, en orden. Sale de contar sus intentos fallidos:
 * crisps (4 formas distintas, 0 correctas), yoghurt (3 intentos, 0 correctas).
 */
export const PRIORITARIAS = [
  'crisps', 'yoghurt', 'pizza', 'cherries', 'apples', 'popcorn', 'sausages',
];

/**
 * Lo que escribio de verdad, para que la pista reconozca SU error.
 * Clave: la palabra correcta. Valor: las formas que escribio.
 */
export const ERRORES_REALES = {
  crisps: ['cribb', 'crisa', 'crips', 'crisp'],
  yoghurt: ['yoghnur', 'yogurt', 'yognur', 'yogur'],
  pizza: ['pisa', 'piza'],
  apples: ['saples', 'aples'],
  cherries: ['citcarics', 'cherrys', 'cheries'],
  popcorn: ['popcoan', 'popcorm'],
  mushrooms: ['musnrooms', 'mushroms'],
};

/* =========================================================================
   6. Pistas de error — lo que convierte un fallo en aprendizaje
   ========================================================================= */

/**
 * La leccion de la Unidad 4: la pista DEBE verificar la palabra esperada. Ante
 * `sheeps` cuando tocaba `farmer`, explicar el plural de sheep confunde.
 *
 * @param {string} escrito   lo que escribio (o marco)
 * @param {string} esperado  la palabra correcta
 */
export function pistaDeError(escrito, esperado) {
  const e = String(escrito || '').trim().toLowerCase();
  const ok = String(esperado || '').trim().toLowerCase();
  if (!e || e === ok) return null;

  /* --- Las tres que mas le cuestan, con su regla --- */
  if (ok === 'yoghurt') {
    return 'Ojo con <b>yoghurt</b>: lleva una <b>h</b> que no se oye, entre la '
         + '<b>g</b> y la <b>u</b>. Se dice "yogurt" pero se escribe y-o-g-<b>h</b>-u-r-t.';
  }
  if (ok === 'crisps') {
    return 'Ojo con <b>crisps</b>: tiene <b>s</b> en el medio y <b>s</b> al final. '
         + 'c-r-i-<b>s</b>-p-<b>s</b>.';
  }
  if (ok === 'pizza') {
    return 'Ojo con <b>pizza</b>: se dice "pitsa" pero lleva <b>doble z</b>.';
  }
  if (ok === 'cherries') {
    return '<b>cherries</b> viene de <i>cherry</i>. Cuando una palabra termina en '
         + '<b>-y</b>, el plural cambia la y por <b>-ies</b>.';
  }
  if (ok === 'apples') {
    return '<b>apples</b> empieza con <b>a</b>: a-p-p-l-e-s. Y lleva <b>doble p</b>.';
  }
  if (ok === 'potatoes') {
    return '<b>potatoes</b> es el único de la olla que lleva <b>-es</b> en el plural, '
         + 'no solo -s.';
  }
  if (ok === 'a pot') {
    return '<b>a pot</b> va con <b>a</b> porque es uno solo. Las otras de la olla van '
         + 'en plural y sin artículo: onions, potatoes, mushrooms.';
  }

  /* --- Consonante doble de mas o de menos --- */
  if (e.replace(/(.)\1/g, '$1') === ok.replace(/(.)\1/g, '$1')) {
    return `Casi: revisa las letras dobles de <b>${esperado}</b>.`;
  }

  return null;
}

/**
 * La pista de la -s de tercera persona. Es la regla que Marina falla de verdad,
 * asi que tiene funcion propia y explica LAS DOS caras, no solo la fallada.
 */
export function pistaTerceraPersona(personaId, gusta) {
  if (personaId === 'I') {
    return 'Con <b>I</b> el verbo va sin -s: <b>I like</b> / <b>I don\'t like</b>.';
  }
  const suj = persona(personaId).sujeto;
  return gusta
    ? `Con <b>${suj}</b> el verbo lleva <b>-s</b>: <b>${suj} like<u>s</u></b>. `
    + `Pero al decir que NO le gusta, la -s desaparece: <b>${suj} doesn't like</b> `
    + '(la -s ya está en el <i>doesn\'t</i>).'
    : `Al decir que NO le gusta, el verbo va <b>sin -s</b>: `
    + `<b>${suj} doesn't like</b>, nunca <i>doesn't likes</i>. `
    + `La -s solo va en el afirmativo: <b>${suj} like<u>s</u></b>.`;
}

/* =========================================================================
   7. Las zonas del mapa
   ========================================================================= */

export const ZONAS = [
  {
    id: 'vocabulario',
    n: 1,
    titulo: 'Birthday food',
    subtitulo: 'Las 8 palabras del cumpleaños',
    icono: '🎂',
    momento: 'fiesta',
  },
  {
    id: 'comidas',
    n: 2,
    titulo: 'Our food',
    subtitulo: 'Animals or plants?',
    icono: '🥛',
    momento: 'comida',
  },
  {
    id: 'escucha',
    n: 3,
    titulo: 'Listen!',
    subtitulo: 'Escucha y reconoce',
    icono: '👂',
    momento: 'escucha',
  },
  {
    id: 'gustos',
    n: 4,
    titulo: 'Likes and dislikes',
    subtitulo: 'He likes… / She doesn\'t like…',
    icono: '😋',
    momento: 'gustos',
  },
  {
    id: 'escribir',
    n: 5,
    titulo: 'Write it!',
    subtitulo: 'Escribe las palabras difíciles',
    icono: '✏️',
    momento: 'escribir',
  },
  {
    id: 'simulacro',
    n: 6,
    titulo: 'Test practice',
    subtitulo: 'Como la prueba, sin ayudas',
    icono: '📝',
    momento: 'prueba',
  },
];

export function zona(id) {
  const z = ZONAS.find((x) => x.id === id);
  if (!z) throw new Error(`Zona desconocida: ${id}`);
  return z;
}

/* =========================================================================
   8. Avisos
   ========================================================================= */

export const AVISOS = {
  bien: ['¡Muy bien! 🎉', 'Well done! ⭐', '¡Correcto! 🎂', 'Excellent! 😋'],
  mal: ['Casi… 💪', 'Try again 🤔', 'Mira bien 👀'],
};
