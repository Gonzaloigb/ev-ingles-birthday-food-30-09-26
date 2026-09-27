/**
 * dibujos.js — dibujos propios para las palabras que ningun emoji representa bien.
 *
 * Por que existe este archivo: casi todo el vocabulario de la unidad se entiende
 * con un emoji, pero hay palabras donde el emoji disponible es ambiguo o esta
 * repetido. La peor: `crisps`.
 *
 *   `crisps`  = papas fritas DE BOLSA (las de paquete, frias)
 *   `potatoes` = papas crudas, las de la olla
 *
 * Los dos caian en el mismo 🥔. Con el mismo dibujo, una pregunta de vocabulario
 * queda sin respuesta correcta unica: Marina podia acertar y ver "errado", o al
 * reves. No era solo feo, estaba mal.
 *
 * La bolsa abierta con papitas saliendo se distingue de una papa cruda al primer
 * vistazo, que es lo que hace falta a los 7 anos.
 */

/** Lienzo comun 100x100, para alinear con los emojis del resto. */
function svg(interior, clase = '') {
  return `<svg viewBox="0 0 100 100" class="dib ${clase}" role="img" aria-hidden="true">${interior}</svg>`;
}

const DIBUJOS = {
  /* ---------- crisps: bolsa abierta con papitas ---------- */
  crisps: () => svg(`
    <!-- Papitas que se escapan por arriba -->
    <g class="papitas">
      <path d="M30 22 q7-6 14-1 q5 4 1 9 q-6 6-13 2 q-5-4-2-10 Z"
            fill="#FCD34D" stroke="#B45309" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M56 14 q8-5 14 2 q4 5-1 9 q-7 5-13-1 q-4-5 0-10 Z"
            fill="#FDE68A" stroke="#B45309" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M44 34 q7-5 12 1 q4 5-2 8 q-7 4-11-2 q-3-4 1-7 Z"
            fill="#FBBF24" stroke="#B45309" stroke-width="2.5" stroke-linejoin="round"/>
    </g>

    <!-- Bolsa: boca abierta arriba, cuerpo hacia abajo -->
    <path d="M22 44 L78 44 L72 92 L28 92 Z"
          fill="#DC2626" stroke="#7F1D1D" stroke-width="3" stroke-linejoin="round"/>
    <!-- La boca rasgada -->
    <path d="M22 44 l9 6 l9-6 l9 6 l9-6 l9 6 l11-6"
          fill="none" stroke="#7F1D1D" stroke-width="3" stroke-linejoin="round"/>
    <!-- Franja de la etiqueta -->
    <rect x="28" y="60" width="44" height="16" rx="4" fill="#FEF3C7" stroke="#7F1D1D" stroke-width="2.5"/>
    <!-- Tres papitas dibujadas en la etiqueta, para que se lea "papas fritas" -->
    <g fill="#F59E0B">
      <ellipse cx="39" cy="68" rx="6" ry="4.5"/>
      <ellipse cx="50" cy="68" rx="6" ry="4.5"/>
      <ellipse cx="61" cy="68" rx="6" ry="4.5"/>
    </g>
    <!-- Brillo, para que la bolsa se lea como plastico -->
    <path d="M32 50 L36 88" stroke="#F87171" stroke-width="4" stroke-linecap="round" opacity=".7"/>
  `, 'd-crisps'),

  /* ---------- yoghurt: pote con cuchara ----------
     El emoji disponible (🍦) es un helado de cono, que es otra cosa. Y yoghurt
     es la segunda palabra que mas le cuesta a Marina, asi que conviene que la
     imagen no la despiste. */
  yoghurt: () => svg(`
    <!-- Cuchara adentro -->
    <rect x="62" y="16" width="6" height="40" rx="3" fill="#94A3B8"
          transform="rotate(14 65 36)"/>
    <ellipse cx="72" cy="18" rx="9" ry="12" fill="#CBD5E1" stroke="#64748B" stroke-width="2.5"
             transform="rotate(14 72 18)"/>

    <!-- Pote -->
    <path d="M24 40 L76 40 L70 88 Q70 92 66 92 L34 92 Q30 92 30 88 Z"
          fill="#F8FAFC" stroke="#64748B" stroke-width="3" stroke-linejoin="round"/>
    <!-- Tapa -->
    <ellipse cx="50" cy="40" rx="26" ry="8" fill="#EC4899" stroke="#9D174D" stroke-width="3"/>
    <ellipse cx="50" cy="39" rx="18" ry="5" fill="#F9A8D4"/>
    <!-- Franja con frutillas, para que se lea "yogur de fruta" -->
    <rect x="31" y="58" width="38" height="18" rx="4" fill="#FCE7F3" stroke="#9D174D" stroke-width="2.5"/>
    <g fill="#DB2777">
      <path d="M40 62 q4-3 7 0 q2 5-3.5 9 Q37 67 40 62 Z"/>
      <path d="M55 62 q4-3 7 0 q2 5-3.5 9 Q52 67 55 62 Z"/>
    </g>
  `, 'd-yoghurt'),

  /* ---------- potatoes: papas crudas, con tierra ---------- */
  potatoes: () => svg(`
    <ellipse cx="34" cy="62" rx="24" ry="18" transform="rotate(-14 34 62)"
             fill="#C8A26A" stroke="#7C5A2E" stroke-width="3"/>
    <ellipse cx="66" cy="50" rx="21" ry="16" transform="rotate(12 66 50)"
             fill="#D9B77F" stroke="#7C5A2E" stroke-width="3"/>
    <ellipse cx="58" cy="76" rx="19" ry="14" transform="rotate(-6 58 76)"
             fill="#BE9459" stroke="#7C5A2E" stroke-width="3"/>
    <!-- Los ojitos de la papa -->
    <g fill="#7C5A2E">
      <ellipse cx="28" cy="56" rx="2.6" ry="1.8"/>
      <ellipse cx="40" cy="68" rx="2.6" ry="1.8"/>
      <ellipse cx="62" cy="45" rx="2.6" ry="1.8"/>
      <ellipse cx="72" cy="55" rx="2.6" ry="1.8"/>
      <ellipse cx="55" cy="79" rx="2.6" ry="1.8"/>
    </g>
  `, 'd-potatoes'),
};

/** Las palabras que tienen dibujo propio. */
export function tieneDibujo(en) {
  return Object.prototype.hasOwnProperty.call(DIBUJOS, en);
}

/**
 * Devuelve el SVG de una palabra.
 * Lanza si no existe: un dibujo que falta debe verse al primer intento, no
 * dejar un hueco silencioso en la pantalla.
 */
export function dibujo(en) {
  const f = DIBUJOS[en];
  if (!f) throw new Error(`Dibujo desconocido: ${en}`);
  return f();
}

/**
 * La imagen de una palabra: su dibujo propio si lo tiene, o su emoji.
 * Es lo que llaman las zonas, para no tener que preguntar cada vez.
 *
 * @param {object} p     entrada del vocabulario (con .en y .emoji)
 * @param {boolean} big  si true, tamano grande (tarjeta de una sola imagen)
 */
export function imagen(p, big = false) {
  if (tieneDibujo(p.en)) {
    return `<span class="dibujo${big ? ' grande' : ''}">${dibujo(p.en)}</span>`;
  }
  return `<span class="emoji${big ? ' grande' : ''}">${p.emoji}</span>`;
}
