/**
 * util.js — piezas compartidas por los seis minijuegos.
 * Todo lo que se repetia en mas de una zona vive aqui.
 */

/** Crea un elemento con clase, HTML y atributos, en una linea. */
export function el(tag, clase = '', html = '', attrs = {}) {
  const n = document.createElement(tag);
  if (clase) n.className = clase;
  if (html) n.innerHTML = html;
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

/** Entero al azar entre min y max, ambos incluidos. */
export function azar(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Un elemento al azar de una lista. */
export function uno(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

/** Copia barajada (Fisher-Yates). No toca el original. */
export function barajar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Saca elementos al azar SIN repetir hasta agotar la lista; recien ahi vuelve
 * a barajar. Es lo que evita que la misma pregunta salga dos veces en una
 * vuelta de la zona: con `uno()` el azar repite, y con temarios chicos repite
 * mucho (regla del proyecto, ver CLAUDE.md).
 */
export function bolsa(lista) {
  let resto = [];
  return () => {
    if (!resto.length) resto = barajar(lista);
    return resto.pop();
  };
}

/**
 * Elige n elementos distintos de una lista, siempre incluyendo `obligatorio`.
 * Se usa para armar las alternativas: la correcta mas distractores.
 */
export function elegirCon(lista, obligatorio, n) {
  const resto = barajar(lista.filter((x) => x !== obligatorio));
  return barajar([obligatorio, ...resto.slice(0, n - 1)]);
}

/** Pausa. */
export function esperar(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Estrellas segun el porcentaje de aciertos. */
export function estrellasPorPuntaje(aciertos, total) {
  if (!total) return 0;
  const p = aciertos / total;
  if (p >= 0.9) return 3;
  if (p >= 0.7) return 2;
  if (p >= 0.5) return 1;
  return 0;
}

/** "★★☆" para mostrar en el mapa. */
export function pintarEstrellas(n, max = 3) {
  return '★'.repeat(n) + '☆'.repeat(Math.max(0, max - n));
}

/** Lluvia de confeti en la celebracion. */
export function confeti(cantidad = 60) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colores = ['#F59E0B', '#EC4899', '#2563EB', '#16A34A', '#F7C948', '#FB923C'];
  for (let i = 0; i < cantidad; i++) {
    const p = el('div', 'confeti');
    p.style.left = `${Math.random() * 100}vw`;
    p.style.background = uno(colores);
    p.style.animationDuration = `${2 + Math.random() * 1.8}s`;
    p.style.animationDelay = `${Math.random() * 0.7}s`;
    if (Math.random() > 0.5) p.style.borderRadius = '50%';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 5200);
  }
}

/**
 * La imagen de una palabra: su emoji.
 * @param {object} p     entrada del vocabulario (con .emoji)
 * @param {boolean} big  si true, tamano grande (tarjeta de una sola imagen)
 */
export function imagen(p, big = false) {
  if (!p.emoji) throw new Error(`Falta el emoji de: ${p.en}`);
  return `<span class="emoji${big ? ' grande' : ''}">${p.emoji}</span>`;
}
