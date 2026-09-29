"""
probar_preguntas.py — prueba de las PREGUNTAS del juego, no de las pantallas.

`verificar.py` mira que el juego se vea y funcione. Este mira lo que se
pregunta, jugando cada zona varias vueltas completas en modo normal:

  1. REPETICION. Falla si una misma pregunta sale dos veces en la misma vuelta
     de una zona. Con temarios chicos el azar repite mucho: el juego de
     historia llego a repetir 24 de cada 130 preguntas.

  2. NIVEL (2° basico, 7 anos). Falla si:
       - una alternativa pasa de MAX_PALABRAS_ALTERNATIVA palabras,
       - lo que hay que leer (instruccion + frase) pasa de MAX_PALABRAS_PREGUNTA,
       - una zona ofrece mas de 3 alternativas en modo normal (el ensayo
         queda fuera: mide sin ayudas).

  3. CONGRUENCIA CON EL LIBRO. No se puede automatizar del todo: que una
     pregunta tenga respaldo en el texto lo juzga una persona. El script
     escribe en `preguntas.txt` TODAS las preguntas distintas que salieron,
     con su respuesta correcta, para revisarlas contra `CONTENIDOS.md` y las
     fotos del libro de una sola pasada.

Es el MISMO script en todos los juegos del proyecto; solo cambia la
configuracion de abajo.

Ya que juega todas las zonas completas, aprovecha de revisar dos cosas de
pantalla que `verificar.py` no alcanza a ver: que nada desborde a lo ancho y
que el boton "Entendido" (tras un error) quede a la vista.

Uso:
    npm run build
    python probar_preguntas.py              # 6 vueltas por zona, Chromium 390px
    python probar_preguntas.py 15           # mas vueltas, mas cobertura
    python probar_preguntas.py --celular    # WebKit (Safari) a 360x640, con toques

Dos trucos para que corra rapido y sin parlantes:
  - El reloj del navegador se adelanta a mano (page.clock): no espera las
    pausas del juego.
  - La voz se reemplaza por una que no suena y anota lo que se le pidio
    decir. Asi la pregunta auditiva ("Escucha y toca…") queda identificada
    por lo que se dijo, que es lo que la distingue de la anterior.
"""

import random
import sys
from collections import Counter, defaultdict
from pathlib import Path

from playwright.sync_api import sync_playwright

# ------------------------------------------------------------------
# Configuracion de ESTE juego
# ------------------------------------------------------------------
CLAVE_ESTADO = "birthday-food-v1"   # la de src/estado.js
ZONAS_IDS = ["vocabulario", "comidas", "escucha", "gustos", "escribir", "simulacro"]
ZONA_ENSAYO = "Test practice"       # mide sin ayudas: puede mostrar todas
# ------------------------------------------------------------------

MAX_PALABRAS_ALTERNATIVA = 12
MAX_PALABRAS_PREGUNTA = 20
MAX_ALTERNATIVAS_NORMAL = 3

RAIZ = Path(__file__).parent
DIST = RAIZ / "dist" / "index.html"
SALIDA = RAIZ / "preguntas.txt"

# Frases visibles que forman parte de la pregunta, segun el juego.
SELECTORES_EXTRA = (".afirmacion", ".ficha-nino", ".frase-hueco", ".frase-examen")

# Una voz que no suena: anota lo que se le pide decir.
VOZ_DE_PRUEBA = """
window.__dicho = [];
window.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
  getVoices: () => [{ name: 'Prueba', lang: 'en-US' }],
  addEventListener() {}, removeEventListener() {}, cancel() {},
  speaking: false, pending: false, paused: false,
  speak(u) { window.__dicho.push(u.text); setTimeout(() => u.onend && u.onend(), 5); },
}});
"""

problemas = []


def palabras(texto):
    return len(texto.split())


def limpio(texto):
    return " ".join(texto.split())


def dicho(page):
    """Lo que la voz dijo desde la ultima vez que se pregunto."""
    return " / ".join(page.evaluate("window.__dicho.splice(0)"))


def jugar_vuelta(page, zi, titulo, catalogo, apariciones):
    page.goto(DIST.as_uri())
    page.clock.run_for(2500)          # iniciarVoz espera hasta 2 s las voces
    page.click("button.btn-grande")
    page.clock.run_for(2500)
    page.query_selector_all(".tarjeta-zona")[zi].click()
    page.clock.run_for(400)

    vistas = Counter()
    for n in range(40):
        if page.query_selector(".fiesta"):
            break
        instruccion = limpio(page.inner_text(".consigna .instruccion"))
        extras = [limpio(page.inner_text(s)) for s in SELECTORES_EXTRA if page.query_selector(s)]
        oido = dicho(page)
        visible = " ".join([instruccion, *extras])
        firma = " ".join(x for x in [instruccion, f"[oye: {oido}]" if oido else "", *extras] if x)
        vistas[firma] += 1

        if palabras(visible) > MAX_PALABRAS_PREGUNTA:
            problemas.append(f"{titulo}: pregunta de {palabras(visible)} palabras: {visible}")

        campo = page.query_selector(".campo:not([disabled])")
        if campo:
            # Pregunta de escribir: la respuesta es lo que se oyo.
            respuesta = oido or "?"
            campo.fill(random.choice([respuesta, "xx"]))
            page.query_selector(".fila-escribir button").click()
        else:
            opciones = page.query_selector_all(".opcion:not(.bloqueada)")
            if not opciones:
                problemas.append(f"{titulo} p{n + 1}: no hay alternativas para tocar")
                return
            textos = [limpio(o.inner_text()) for o in opciones]
            for t in textos:
                if palabras(t) > MAX_PALABRAS_ALTERNATIVA:
                    problemas.append(f"{titulo}: alternativa de {palabras(t)} palabras: {t}")
            if titulo != ZONA_ENSAYO and len(textos) > MAX_ALTERNATIVAS_NORMAL:
                problemas.append(f"{titulo}: {len(textos)} alternativas en modo normal: {firma}")

            # Responder al azar, para pasar tambien por los errores
            random.choice(opciones).click()
            page.clock.run_for(100)
            buena = page.query_selector(".opcion.correcta")
            respuesta = limpio(buena.inner_text()) if buena else "? (no se marca la correcta)"

        catalogo[titulo][firma].add(respuesta)
        apariciones[titulo][firma] += 1

        ancho = page.evaluate("document.documentElement.scrollWidth")
        if ancho > page.viewport_size["width"] + 1:
            problemas.append(f"{titulo}: desborde horizontal de {ancho}px en: {firma}")

        seguir = page.query_selector(".btn-seguir")
        if seguir:
            # El scroll suave hacia el aviso lo anima el navegador en tiempo
            # REAL, no con el reloj de mentira: hay que esperarlo de verdad.
            page.clock.run_for(800)
            page.wait_for_timeout(700)
            caja = seguir.bounding_box()
            if not caja or caja["y"] + caja["height"] > page.viewport_size["height"] + 2:
                problemas.append(f"{titulo}: el boton Entendido queda fuera de pantalla en: {firma}")
            seguir.click()
        # El reloj es de mentira: adelantar de mas no cuesta nada, y cubre
        # juegos que esperan hasta 2,9 s tras un error.
        page.clock.run_for(3500)

    for firma, veces in vistas.items():
        if veces > 1:
            problemas.append(f"{titulo}: sale {veces} veces en la misma vuelta: {firma}")


def main():
    if not DIST.exists():
        print(f"No existe {DIST}. Corre primero: npm run build")
        sys.exit(1)
    numeros = [a for a in sys.argv[1:] if a.isdigit()]
    vueltas = int(numeros[0]) if numeros else 6
    celular = "--celular" in sys.argv

    catalogo = defaultdict(lambda: defaultdict(set))
    apariciones = defaultdict(Counter)

    with sync_playwright() as pw:
        if celular:
            nav = pw.webkit.launch()
            ctx = nav.new_context(viewport={"width": 360, "height": 640},
                                  has_touch=True, is_mobile=True)
        else:
            nav = pw.chromium.launch()
            ctx = nav.new_context(viewport={"width": 390, "height": 800})
        ctx.add_init_script(VOZ_DE_PRUEBA)
        page = ctx.new_page()
        errores = []
        page.on("pageerror", lambda e: errores.append(str(e)))
        page.clock.install()

        # Todas las zonas abiertas y en modo normal
        page.goto(DIST.as_uri())
        page.evaluate(
            """([clave, ids]) => localStorage.setItem(clave, JSON.stringify({
                estrellas: Object.fromEntries(ids.map((id) => [id, 3])),
                palabras: {}, simulacros: [], modo: 'normal' }))""",
            [CLAVE_ESTADO, ZONAS_IDS],
        )
        page.goto(DIST.as_uri())
        page.clock.run_for(2500)
        page.click("button.btn-grande")
        page.clock.run_for(2500)
        # "Zona 3: Listen!" → "Listen!"
        titulos = [
            t.get_attribute("aria-label").split(": ", 1)[-1]
            for t in page.query_selector_all(".tarjeta-zona")
        ]

        for zi, titulo in enumerate(titulos):
            for _ in range(vueltas):
                jugar_vuelta(page, zi, titulo, catalogo, apariciones)
            print(f"  {titulo}: {len(catalogo[titulo])} preguntas distintas en {vueltas} vueltas")

        problemas.extend(f"error de consola: {e[:150]}" for e in errores)
        nav.close()

    # --- Catalogo para la revision a mano contra el libro ---
    lineas = [
        "Catalogo de preguntas — generado por probar_preguntas.py.",
        "Revisar cada una contra CONTENIDOS.md y el libro: ¿tiene respaldo en el",
        "texto? ¿la respuesta es la del libro? ¿se entiende a los 7 anos?",
        "",
    ]
    for titulo in titulos:
        lineas.append(f"=== {titulo} ({len(catalogo[titulo])} preguntas distintas) ===")
        for firma in sorted(catalogo[titulo]):
            resp = " / ".join(sorted(catalogo[titulo][firma]))
            lineas.append(f"- {firma}")
            lineas.append(f"    → {resp}   (salió {apariciones[titulo][firma]} veces)")
        lineas.append("")
    SALIDA.write_text("\n".join(lineas), encoding="utf-8")
    print(f"\nCatalogo escrito en {SALIDA.name}")

    print("\n" + "=" * 60)
    if problemas:
        print(f"{len(problemas)} problema(s):")
        for p in sorted(set(problemas)):
            print(f"  [X] {p}")
        sys.exit(1)
    print("Sin repeticiones ni problemas de nivel.")
    print("Falta a mano: revisar preguntas.txt contra el libro.")


if __name__ == "__main__":
    main()
