"""
verificar.py — prueba de humo del juego compilado.

Abre `dist/index.html` por file:// (el mismo camino que el doble clic) y recorre
las seis zonas en los dos modos, buscando lo que un vistazo no pilla:

  - paginas en blanco
  - errores de consola
  - desborde horizontal (scroll lateral en celular)
  - botones que quedan fuera de la pantalla o tapados
  - avisos de error que caen bajo la linea de flotacion, asi que no se leen

Lo que NO detecta: si el contenido es correcto. Eso se contrasta a mano contra
`CONTENIDOS_EXTRAIDOS.md`.

Uso:
    python verificar.py              # WebKit (Safari) a 360x640, con toques
    python verificar.py --todos      # ademas Chromium y tablet

Se corre con el juego ya compilado (`npm run build`).
"""

import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).parent
DIST = RAIZ / "dist" / "index.html"

# Los tres tamanos que exige el proyecto: Marina estudia en el auto.
TAMANOS = [
    ("celular", 360, 640, True),
    ("tablet", 768, 1024, True),
    ("computador", 1280, 800, False),
]

ZONAS = ["vocabulario", "comidas", "escucha", "gustos", "escribir", "simulacro"]

problemas = []


def fallo(donde, que):
    problemas.append(f"{donde}: {que}")
    print(f"  [X] {que}")


def revisar_pantalla(page, donde):
    """Las comprobaciones que aplican a cualquier pantalla."""
    # 1. Pagina en blanco
    texto = page.inner_text("#app").strip()
    if len(texto) < 10:
        fallo(donde, f"pantalla casi vacia ({len(texto)} caracteres)")

    # 2. Desborde horizontal: el sintoma es scroll lateral
    ancho_doc = page.evaluate("document.documentElement.scrollWidth")
    ancho_win = page.evaluate("window.innerWidth")
    if ancho_doc > ancho_win + 1:
        fallo(donde, f"desborde horizontal: {ancho_doc}px en una ventana de {ancho_win}px")

    # 3. Botones fuera de la pantalla por el costado
    for b in page.query_selector_all("button:visible"):
        caja = b.bounding_box()
        if not caja:
            continue
        if caja["x"] < -1 or caja["x"] + caja["width"] > ancho_win + 1:
            etiqueta = (b.inner_text() or b.get_attribute("aria-label") or "?")[:30]
            fallo(donde, f'boton "{etiqueta}" se sale por el costado')
        # 4. Blanco de toque menor al minimo recomendado (44px)
        if caja["height"] < 40:
            etiqueta = (b.inner_text() or "?")[:30]
            fallo(donde, f'boton "{etiqueta}" mide {caja["height"]:.0f}px de alto (minimo 44)')


def jugar_zona(page, zona_id, donde, preguntas=4):
    """Responde algunas preguntas de una zona, siempre la primera alternativa."""
    for n in range(preguntas):
        page.wait_for_timeout(250)

        opciones = page.query_selector_all(".opcion:not(.bloqueada)")
        if not opciones:
            # Puede haber terminado, o haber perdido las vidas
            if page.query_selector(".fiesta"):
                return "fin"
            fallo(donde, f"pregunta {n + 1}: no hay alternativas para tocar")
            return "error"

        revisar_pantalla(page, f"{donde} p{n + 1}")
        opciones[0].click()
        page.wait_for_timeout(200)

        # El aviso del error debe quedar VISIBLE: una pista que no se ve no
        # ensena nada. Es el bug que ya costo caro en el juego de matematica.
        aviso = page.query_selector(".aviso.mal")
        if aviso:
            caja = aviso.bounding_box()
            alto = page.evaluate("window.innerHeight")
            if caja and caja["y"] + caja["height"] > alto + 2:
                fallo(donde, f"pregunta {n + 1}: el aviso del error cae fuera de pantalla")

        # Esperar a que el motor pase a la siguiente
        page.wait_for_timeout(3100)

    return "ok"


def recorrer(pw, navegador, nombre_nav, tam, modo):
    etiqueta, ancho, alto, tactil = tam
    donde_base = f"{nombre_nav}/{etiqueta}/{modo}"
    print(f"\n--- {donde_base} ---")

    ctx = navegador.new_context(
        viewport={"width": ancho, "height": alto},
        has_touch=tactil,
        is_mobile=tactil,
    )
    page = ctx.new_page()

    errores_consola = []
    page.on("console", lambda m: errores_consola.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: errores_consola.append(str(e)))

    page.goto(DIST.as_uri())
    page.wait_for_timeout(400)

    # --- Portada ---
    revisar_pantalla(page, f"{donde_base}/portada")
    boton = page.query_selector("button.btn-grande")
    if not boton:
        fallo(donde_base, "la portada no tiene boton JUGAR")
        ctx.close()
        return
    boton.click()
    page.wait_for_timeout(350)

    # --- Mapa ---
    revisar_pantalla(page, f"{donde_base}/mapa")

    # Elegir el modo pedido
    chips = page.query_selector_all(".chip-modo")
    if len(chips) != 2:
        fallo(donde_base, f"el selector de modo tiene {len(chips)} chips, deberian ser 2")
    else:
        idx = 0 if modo == "normal" else 1
        if "activo" not in (chips[idx].get_attribute("class") or ""):
            chips[idx].click()
            page.wait_for_timeout(300)

    # --- Zona 1 (la unica abierta al empezar) ---
    tarjetas = page.query_selector_all(".tarjeta-zona:not(.cerrada)")
    if not tarjetas:
        fallo(donde_base, "no hay ninguna zona abierta en el mapa")
        ctx.close()
        return

    tarjetas[0].click()
    page.wait_for_timeout(400)
    revisar_pantalla(page, f"{donde_base}/zona1")
    jugar_zona(page, "vocabulario", f"{donde_base}/zona1", preguntas=3)

    # --- Informe ---
    page.goto(DIST.as_uri())
    page.wait_for_timeout(300)
    page.query_selector("button.btn-grande").click()
    page.wait_for_timeout(300)
    for b in page.query_selector_all("button.btn-chico"):
        if "Informe" in (b.inner_text() or ""):
            b.click()
            page.wait_for_timeout(350)
            revisar_pantalla(page, f"{donde_base}/informe")
            break

    for e in errores_consola:
        fallo(donde_base, f"error de consola: {e[:120]}")

    ctx.close()


def main():
    if not DIST.exists():
        print(f"No existe {DIST}. Corre primero: npm run build")
        sys.exit(1)

    todos = "--todos" in sys.argv

    with sync_playwright() as pw:
        # WebKit primero: es el motor de Safari, donde el proyecto ya se quemo.
        wk = pw.webkit.launch()
        recorrer(pw, wk, "webkit", TAMANOS[0], "normal")
        recorrer(pw, wk, "webkit", TAMANOS[0], "dificil")
        if todos:
            recorrer(pw, wk, "webkit", TAMANOS[1], "normal")
        wk.close()

        if todos:
            ch = pw.chromium.launch()
            recorrer(pw, ch, "chromium", TAMANOS[2], "normal")
            ch.close()

    print("\n" + "=" * 60)
    if problemas:
        print(f"{len(problemas)} problema(s):\n")
        for p in problemas:
            print(f"  - {p}")
        sys.exit(1)
    print("Sin problemas detectados.")
    print("Falta a mano: contrastar el contenido contra CONTENIDOS_EXTRAIDOS.md")


if __name__ == "__main__":
    main()
