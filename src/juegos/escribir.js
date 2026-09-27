/**
 * ZONA 5 — Write it!
 *
 * La prueba es "auditiva, guiada y ESCRITA". Esta zona cubre lo escrito: se oye
 * la palabra y hay que teclearla. El texto en ingles nunca se muestra — si se
 * muestra, no es escribir, es copiar.
 *
 * El guion NO es al azar: sale de contar los errores reales de Marina en su
 * libro. `crisps` lo escribio de 4 formas distintas y ninguna correcta;
 * `yoghurt` 3 veces, tampoco. Esas salen mas.
 *
 * Al fallar, la pista es primero la REGLA de esa palabra (pistaDeError) y, si
 * no hay regla que aplique, la comparacion letra por letra.
 */

import { TODAS, PRIORITARIAS, ERRORES_REALES, palabra, pistaDeError, AVISOS } from '../datos.js';
import { el, barajar, uno } from '../util.js';
import { imagen } from '../dibujos.js';
import { correrZona } from '../motor.js';

const TOTAL = 10;

/** Quita acentos, espacios de sobra y mayusculas. */
function limpiar(t) {
  return String(t).trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Devuelve la palabra correcta con la letra errada en rojo. */
function compararLetras(escrito, esperado) {
  const e = limpiar(escrito);
  const ok = esperado.toLowerCase();
  let html = '';
  for (let i = 0; i < Math.max(e.length, ok.length); i++) {
    const c = ok[i] ?? '';
    const bien = e[i] === c;
    html += `<span style="color:${bien ? '#16A34A' : '#DC2626'};font-weight:800">${c || '·'}</span>`;
  }
  return html;
}

/** ¿Es una de las formas que Marina escribio de verdad? */
function esSuError(escrito, esperado) {
  const lista = ERRORES_REALES[esperado];
  return Array.isArray(lista) && lista.includes(limpiar(escrito));
}

export function jugarEscribir({ zona, onSalir, onFin, modo }) {
  // Las que fallo en el libro salen primero y mas veces.
  const guion = barajar([
    ...PRIORITARIAS,
    ...barajar(TODAS.map((p) => p.en)).slice(0, 3),
  ]).slice(0, TOTAL);

  correrZona({
    zona,
    total: TOTAL,
    onSalir,
    onFin,
    modo,
    montar(ctx, i) {
      montarEscribir(ctx, palabra(guion[i % guion.length]));
    },
  });
}

function montarEscribir(ctx, p) {
  ctx.pedir({
    instruccion: 'Escucha y escribe la palabra',
    textoIngles: p.en,
    mostrar: false,   // si se muestra, no es escribir: es copiar
  });

  const tarjeta = el('div', 'tarjeta-emoji', imagen(p, true));
  ctx.zonaJuego.append(tarjeta);

  const campo = el('input', 'campo', '', {
    type: 'text',
    autocomplete: 'off',
    autocapitalize: 'off',
    autocorrect: 'off',
    spellcheck: 'false',
    placeholder: 'Escribe aquí…',
    'aria-label': 'Escribe la palabra que escuchaste',
  });

  const btn = el('button', 'btn-chico destacado', 'Comprobar', { type: 'button' });

  // Evita el doble envio: con Enter y con el boton a la vez.
  let respondido = false;

  const enviar = () => {
    if (respondido) return;
    const escrito = limpiar(campo.value);
    // Campo vacio no cuenta como error: no aporta nada saber que no escribio.
    if (!escrito) { campo.focus(); return; }
    respondido = true;

    const acerto = escrito === p.en.toLowerCase();
    campo.classList.add(acerto ? 'correcta' : 'errada');
    campo.disabled = true;
    btn.disabled = true;

    // Primero la regla de esa palabra; si no aplica, letra por letra.
    let pista = pistaDeError(escrito, p.en);
    if (!pista) pista = `Se escribe: ${compararLetras(escrito, p.en)}`;
    else if (esSuError(escrito, p.en)) {
      // Es uno de los errores que ya cometio en el libro: vale reforzar.
      pista += `<br>Se escribe: ${compararLetras(escrito, p.en)}`;
    }

    ctx.responder({
      acerto,
      palabra: p.en,
      mensajeBien: uno(AVISOS.bien),
      mensajeMal: `Era <b>${p.en}</b>.`,
      pista,
    });
  };

  campo.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') { ev.preventDefault(); enviar(); }
  });
  btn.addEventListener('click', enviar);

  const fila = el('div', 'fila-escribir');
  fila.append(campo, btn);
  ctx.zonaJuego.append(fila);

  campo.focus();
}
