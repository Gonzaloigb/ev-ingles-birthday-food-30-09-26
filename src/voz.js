/**
 * voz.js — la voz en ingles del juego (Web Speech API).
 *
 * Esta es la pieza critica: la prueba de Marina es AUDITIVA.
 * Si esto falla, el juego no sirve para lo que fue hecho.
 *
 * Dos trampas de esta API que estan resueltas aqui:
 *  1. Las voces llegan ASINCRONAS. Si se pide hablar antes de que carguen,
 *     el primer audio sale mudo o en español. Por eso se espera a `voces()`.
 *  2. Los navegadores exigen un gesto del usuario (un clic) antes del primer
 *     sonido. Por eso el juego parte con una portada con boton.
 */

let vocesCache = null;
let vozElegida = null;
let listo = false;

/** Espera a que el navegador entregue la lista de voces. */
function voces() {
  return new Promise((resolve) => {
    const actuales = speechSynthesis.getVoices();
    if (actuales.length) return resolve(actuales);

    // En Chrome/Edge llegan por evento, no de inmediato.
    let resuelto = false;
    const terminar = () => {
      if (resuelto) return;
      resuelto = true;
      resolve(speechSynthesis.getVoices());
    };
    speechSynthesis.addEventListener('voiceschanged', terminar, { once: true });
    // Red de seguridad: si el evento nunca llega, seguimos igual a los 2s.
    setTimeout(terminar, 2000);
  });
}

/**
 * Elige la mejor voz en ingles disponible.
 * Prioridad: voces neuronales de Edge > cualquier en-US > cualquier en-*.
 */
function mejorVoz(lista) {
  const ingles = lista.filter((v) => /^en(-|_)/i.test(v.lang));
  if (!ingles.length) return null;

  const preferidas = [
    /Aria/i, /Jenny/i, /Michelle/i, /Guy/i, // voces neuronales de Edge
    /Zira/i, /David/i,                       // voces de Windows
  ];
  for (const patron of preferidas) {
    const hit = ingles.find((v) => patron.test(v.name));
    if (hit) return hit;
  }
  return ingles.find((v) => /^en-US/i.test(v.lang)) || ingles[0];
}

/** Prepara la voz. Devuelve true si hay voz en ingles disponible. */
export async function iniciarVoz() {
  if (!('speechSynthesis' in window)) {
    listo = false;
    return false;
  }
  vocesCache = await voces();
  vozElegida = mejorVoz(vocesCache);
  listo = Boolean(vozElegida);
  return listo;
}

export function hayVoz() {
  return listo;
}

export function nombreVoz() {
  return vozElegida ? `${vozElegida.name} (${vozElegida.lang})` : 'ninguna';
}

/**
 * Dice un texto en ingles.
 * @param {string} texto
 * @param {{lento?: boolean}} opciones  lento = para repetir cuando no entendio
 * @returns {Promise<void>} se resuelve cuando termina de hablar
 */
export function decir(texto, opciones = {}) {
  return new Promise((resolve) => {
    if (!listo) return resolve();

    // Cortar lo que este sonando: si Marina toca "repetir", manda lo nuevo.
    speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(texto);
    u.voice = vozElegida;
    u.lang = vozElegida.lang || 'en-US';
    // Despacio: es una niña de 7 años aprendiendo, no un adulto nativo.
    u.rate = opciones.lento ? 0.6 : 0.82;
    u.pitch = 1.05;
    u.volume = 1;

    let terminado = false;
    const fin = () => {
      if (terminado) return;
      terminado = true;
      resolve();
    };
    u.onend = fin;
    u.onerror = fin;
    // Red de seguridad: si el navegador se traga el evento, no dejamos colgada
    // la promesa (pasa en Chrome con textos largos).
    setTimeout(fin, 400 + texto.length * 120);

    speechSynthesis.speak(u);
  });
}

/** Corta cualquier audio en curso (al salir de una zona). */
export function callar() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}
