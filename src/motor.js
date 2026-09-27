/**
 * motor.js — el esqueleto que comparten los seis minijuegos.
 *
 * Cada zona solo define COMO se ve una pregunta y QUE es correcto.
 * El conteo de aciertos, la barra de progreso, el audio, los avisos, las vidas
 * y la pantalla final viven aqui, una sola vez.
 *
 * Viene del motor del juego de ciencias (dos modos, vidas), y recupera la VOZ
 * del juego de ingles de la Unidad 4: la prueba es auditiva, asi que el audio no
 * es adorno, es el contenido evaluado.
 *
 * `pedir()` dice la frase sola al aparecer, y deja botones para repetirla y para
 * oirla mas lento. En modo dificil NO se muestra el texto escrito: hay que
 * entenderlo de oido, que es como sera la prueba.
 */

import { el, esperar, estrellasPorPuntaje, confeti, pintarEstrellas, uno } from './util.js';
import { sonarBien, sonarMal, sonarVictoria, sonarEstrella } from './audio.js';
import { guardarEstrellas, registrar } from './estado.js';
import { crearMascota, crearRacha, animarRespuesta, FRASES } from './vida.js';
import { MODOS, modo as modoDe } from './modos.js';
import { decir, callar } from './voz.js';

/**
 * Arranca una zona.
 *
 * @param {object} cfg
 *  - zona:        objeto de ZONAS
 *  - total:       cuantas preguntas
 *  - montar(ctx): dibuja UNA pregunta. Recibe el contexto y el indice.
 *  - onSalir():   volver al mapa
 *  - onFin(r):    al terminar
 *  - modo:        'normal' | 'dificil'  (por defecto, el guardado)
 *  - forzarDuro:  el simulacro mide siempre, aunque se juegue en normal
 */
export function correrZona(cfg) {
  const raiz = document.getElementById('app');
  const { zona, total, montar, onSalir, onFin, forzarDuro = false } = cfg;

  const m = modoDe(cfg.modo);
  // El simulacro no da pistas ni apoyo aunque se juegue en modo normal: ahi la
  // idea es medir, no ensenar. Pero tampoco quita vidas — perder el simulacro
  // a la tercera no ayuda a nadie.
  const ayuda = forzarDuro ? false : m.ayuda;

  let indice = 0;
  let aciertos = 0;
  let vidas = m.vidas;
  const fallos = [];

  /* ---------- Estructura de la pantalla ---------- */
  const pantalla = el('div', `pantalla cielo-${zona.momento}`);

  const barra = el('div', 'barra');
  const btnVolver = el('button', 'btn-volver', '⬅ Volver', { type: 'button' });
  const titulo = el('h2', 'titulo-zona', `${zona.icono} ${zona.titulo}`);
  const contador = el('div', 'contador');
  const progreso = el('div', 'progreso', '<i></i>');
  const marcaVidas = el('div', 'vidas');
  barra.append(btnVolver, titulo, progreso, contador);
  if (m.vidas > 0) barra.append(marcaVidas);

  const tablero = el('div', 'tablero');
  const consigna = el('div', 'consigna');
  const zonaJuego = el('div', 'zona-juego');
  const aviso = el('div', 'aviso');
  tablero.append(consigna, zonaJuego, aviso);

  // La vida del juego: acompana y celebra, sin cambiar lo que se evalua.
  const mascota = crearMascota();
  const racha = crearRacha();
  barra.append(racha.nodo);

  pantalla.append(barra, tablero, mascota.nodo);
  raiz.replaceChildren(pantalla);

  btnVolver.addEventListener('click', () => {
    callar();
    onSalir();
  });

  function pintarVidas() {
    if (m.vidas <= 0) return;
    marcaVidas.textContent = '❤️'.repeat(Math.max(0, vidas));
  }

  /* ---------- Contexto que recibe cada minijuego ---------- */
  const ctx = {
    consigna,
    zonaJuego,
    // Para que una zona pueda animar el boton que se toco.
    animar: animarRespuesta,
    mascota,
    modo: m.id,
    // Las zonas preguntan esto para decidir cuantas alternativas ofrecer.
    ayuda,
    opciones: m.opciones,

    /**
     * Arma la consigna.
     * @param {object} p
     *  - instruccion:  que tiene que hacer (en espanol)
     *  - textoIngles:  lo que se dice en voz alta (opcional)
     *  - apoyo:        recordatorio de la regla (opcional)
     *  - mostrar:      si false, nunca escribe el texto en ingles (zona de escribir)
     * @returns {{reproducir: Function}} para repetir el audio desde la zona
     */
    pedir({ instruccion, textoIngles = '', apoyo = '', mostrar = true }) {
      consigna.replaceChildren();
      consigna.append(el('p', 'instruccion', instruccion));

      let reproducir = () => {};

      if (textoIngles) {
        const fila = el('div', 'fila-audio');
        const btn = el('button', 'btn-audio',
          '<span class="bocina">🔊</span> Escuchar', { type: 'button' });
        const btnLento = el('button', 'btn-chico', '🐢 Más lento', { type: 'button' });

        reproducir = async (lento) => {
          btn.classList.add('sonando');
          await decir(textoIngles, { lento });
          btn.classList.remove('sonando');
        };
        btn.addEventListener('click', () => reproducir(false));
        btnLento.addEventListener('click', () => reproducir(true));

        fila.append(btn, btnLento);
        consigna.append(fila);

        // En modo dificil el texto no se muestra: hay que entenderlo de oido.
        if (mostrar && ayuda) consigna.append(el('p', 'frase-en', textoIngles));

        // Se dice sola al aparecer: es un ejercicio auditivo.
        reproducir(false);
      }

      if (apoyo && ayuda) consigna.append(el('p', 'apoyo', apoyo));
      return { reproducir };
    },

    /** Marca la respuesta y pasa a la siguiente pregunta. */
    async responder({ acerto, palabra, mensajeBien, mensajeMal, pista }) {
      if (palabra) registrar(palabra, acerto);

      if (acerto) {
        aciertos += 1;
        sonarBien();

        // La racha premia la constancia, no el resultado final: se puede ir mal
        // en la zona y aun asi encadenar tres buenas.
        const subio = racha.sumar();
        const n = racha.cuenta();
        const frase = subio
          ? uno(FRASES[`racha${n}`] || FRASES.bien)
          : uno(FRASES.bien);
        mascota.reaccionar('feliz', frase);

        aviso.className = 'aviso bien';
        aviso.replaceChildren(el('span', '', mensajeBien || '¡Muy bien! 🎉'));
      } else {
        fallos.push(palabra);
        sonarMal();
        racha.romper();
        mascota.reaccionar('triste', uno(FRASES.mal));
        vidas -= 1;
        pintarVidas();
        aviso.className = 'aviso mal';
        // Con HTML, no como texto plano: los mensajes de este juego destacan la
        // forma correcta en negrita, y es justo lo que hay que mirar.
        aviso.replaceChildren(el('span', '', mensajeMal || 'Casi… 💪'));
        // La pista es lo que convierte el error en aprendizaje. En modo dificil
        // y en el simulacro se calla, porque ahi la idea es medir.
        if (pista && ayuda) aviso.append(el('span', 'pista', pista));   // admite HTML

        // En celular el aviso nace al pie y puede quedar bajo la linea de
        // flotacion: una pista que no se ve no ensena nada. Se trae a la vista.
        if (aviso.getBoundingClientRect().bottom > window.innerHeight) {
          aviso.scrollIntoView({ block: 'end', behavior: 'smooth' });
        }
      }

      // Un error necesita mas tiempo en pantalla: hay que alcanzar a leer la razon.
      await esperar(acerto ? 1100 : (ayuda ? 2900 : 1100));
      aviso.className = 'aviso';
      aviso.replaceChildren();

      // Modo dificil: sin vidas, la zona vuelve a empezar.
      if (m.vidas > 0 && vidas <= 0) return sinVidas();

      indice += 1;
      siguiente();
    },
  };

  /* ---------- Ciclo de preguntas ---------- */
  function pintarBarra() {
    contador.textContent = `${indice + 1} / ${total}`;
    progreso.querySelector('i').style.width = `${(indice / total) * 100}%`;
    pintarVidas();
  }

  function siguiente() {
    if (indice >= total) return terminar();
    pintarBarra();
    zonaJuego.replaceChildren();
    montar(ctx, indice);
  }

  /** Reinicia el estado de la partida sin reconstruir el DOM. */
  function reiniciar() {
    indice = 0;
    aciertos = 0;
    racha.romper();
    vidas = m.vidas;
    fallos.length = 0;
    raiz.replaceChildren(pantalla);
    tablero.replaceChildren(consigna, zonaJuego, aviso);
    siguiente();
  }

  /** Modo dificil: se acabaron las vidas. */
  function sinVidas() {
    sonarMal();
    const panel = el('div', 'fiesta');
    panel.append(
      el('h2', '', 'Se acabaron las vidas 💔'),
      el('div', 'puntaje', `Llegaste a la pregunta ${indice + 1} de ${total}`),
      el('div', 'panel',
        '<h3>No pasa nada</h3><p>En modo difícil no hay pistas y cada error cuesta ' +
        'una vida. Puedes intentarlo otra vez o cambiar a modo normal desde el mapa.</p>'),
    );

    const botones = el('div', 'fila-botones');
    const otra = el('button', 'btn-chico destacado', '🔁 Intentar de nuevo', { type: 'button' });
    const volver = el('button', 'btn-chico', '🗺️ Volver al mapa', { type: 'button' });
    otra.addEventListener('click', reiniciar);
    volver.addEventListener('click', () => onFin({ aciertos, total, estrellas: 0, perdio: true }));
    botones.append(otra, volver);
    panel.append(botones);

    tablero.replaceChildren(panel);
  }

  async function terminar() {
    callar();
    progreso.querySelector('i').style.width = '100%';
    contador.textContent = `${total} / ${total}`;

    const estrellas = estrellasPorPuntaje(aciertos, total);
    guardarEstrellas(zona.id, estrellas);

    const fiesta = el('div', 'fiesta');
    const bien = aciertos >= total * 0.7;
    fiesta.append(
      el('h2', '', bien ? '¡Excelente, Marina! 🎉' : '¡Buen intento! 💪'),
      el('div', 'estrellas-grandes',
        [0, 1, 2].map((i) => `<span>${i < estrellas ? '⭐' : '☆'}</span>`).join('')),
      el('div', 'puntaje', `${aciertos} de ${total} correctas`),
    );

    if (m.vidas > 0 && bien) {
      fiesta.append(el('div', 'sello-duro', '🔥 En modo difícil'));
    }

    if (fallos.filter(Boolean).length) {
      const unicos = [...new Set(fallos.filter(Boolean))];
      fiesta.append(el('div', 'panel',
        `<h3>Para repasar</h3><p>${unicos.map(legible).join(' · ')}</p>`));
    }

    const botones = el('div', 'fila-botones');
    const otra = el('button', 'btn-chico destacado', '🔁 Jugar de nuevo', { type: 'button' });
    const volver = el('button', 'btn-chico', '🗺️ Volver al mapa', { type: 'button' });
    otra.addEventListener('click', reiniciar);
    volver.addEventListener('click', () => onFin({ aciertos, total, estrellas }));
    botones.append(otra, volver);
    fiesta.append(botones);

    tablero.replaceChildren(fiesta);

    if (bien) {
      mascota.reaccionar('feliz', '¡Lo lograste!', 3000);
      sonarVictoria();
      confeti(70);
      for (let i = 0; i < estrellas; i++) {
        await esperar(220);
        sonarEstrella();
      }
    }
  }

  siguiente();
}

/**
 * Nombre legible de un concepto, para el informe y el "para repasar".
 *
 * Los conceptos se guardan como identificadores sin tildes (`cambio-evaporar`)
 * porque son claves de localStorage. Aqui se traducen a como se dicen.
 */
const NOMBRES = {
  'birthday card': 'birthday card',
  'orange juice': 'orange juice',
  'a pot': 'a pot',
  'tercera-persona': 'la -s de he/she likes',
  'food-animals': 'comida de animales',
  'food-plants': 'comida de plantas',
  'have-you-got': 'Have you got…?',
  'like-dislike': "I like / I don't like",
};

export function legible(concepto) {
  return NOMBRES[concepto] || String(concepto).replace(/-/g, ' ');
}

/** Pinta las estrellas — reexportado para que las zonas no importen util. */
export { pintarEstrellas, MODOS };
