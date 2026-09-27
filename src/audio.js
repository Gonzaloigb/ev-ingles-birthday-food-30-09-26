/**
 * audio.js — efectos de sonido sintetizados con WebAudio.
 *
 * Sin archivos externos: se generan las notas en el momento.
 * Ventaja para este proyecto: cero peso, cero descargas, funciona sin internet
 * y no hay que buscar sonidos con licencia dudosa.
 */

let ctx = null;

function contexto() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  // Los navegadores suspenden el audio hasta que hay un gesto del usuario.
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/** Despierta el audio. Se llama desde el primer clic (la portada). */
export function despertarAudio() {
  contexto();
}

/**
 * Toca una nota.
 * @param {number} freq   frecuencia en Hz
 * @param {number} inicio segundos desde ahora
 * @param {number} dur    duracion en segundos
 * @param {string} tipo   forma de onda
 * @param {number} vol    volumen 0-1
 */
function nota(freq, inicio, dur, tipo = 'sine', vol = 0.22) {
  const c = contexto();
  if (!c) return;

  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = tipo;
  osc.frequency.value = freq;

  const t = c.currentTime + inicio;
  // Envolvente suave: sin esto se escucha un "click" al empezar y terminar.
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

/** Acierto: tres notas que suben. */
export function sonarBien() {
  nota(587.33, 0, 0.12, 'sine', 0.2);  // Re
  nota(739.99, 0.09, 0.12, 'sine', 0.2); // Fa#
  nota(987.77, 0.18, 0.28, 'sine', 0.22); // Si
}

/** Error: dos notas graves que bajan. Suave, no punitivo. */
export function sonarMal() {
  nota(311.13, 0, 0.14, 'triangle', 0.16);
  nota(233.08, 0.12, 0.26, 'triangle', 0.16);
}

/** Toque de un boton. */
export function sonarToque() {
  nota(880, 0, 0.07, 'sine', 0.1);
}

/** Zona completada: fanfarria de 6 notas. */
export function sonarVictoria() {
  const melodia = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
  melodia.forEach((f, i) => nota(f, i * 0.13, 0.3, 'sine', 0.2));
}

/** Estrella ganada: un brillo agudo. */
export function sonarEstrella() {
  nota(1318.51, 0, 0.1, 'sine', 0.16);
  nota(1760, 0.08, 0.22, 'sine', 0.14);
}
