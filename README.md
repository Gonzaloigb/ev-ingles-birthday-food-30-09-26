# It's my birthday!

Juego para practicar la prueba de inglés de 2° básico: Unidad 5 de *Learn with
Us 2* — vocabulario de comida y cumpleaños, `Have you got…?` y
`I like` / `I don't like`.

**Jugar:** https://gonzaloigb.github.io/ev-ingles-birthday-food-30-09-26/

> **La prueba es auditiva.** Sube el volumen. Si la voz no suena en inglés,
> abre el enlace con **Microsoft Edge** o **Chrome**: traen voces en inglés que
> otros navegadores no tienen.

## Qué trae

| Zona | Contenido |
|---|---|
| 1 · Birthday food | Las 8 palabras del cumpleaños |
| 2 · Our food | Food from animals / from plants, y la olla |
| 3 · Listen! | Escuchar y reconocer, sin ver el texto |
| 4 · Likes and dislikes | He likes… / She doesn't like… |
| 5 · Write it! | Escribir al dictado las palabras difíciles |
| 6 · Test practice | Como la prueba, sin ayudas |

La zona 4 es la más importante: trabaja la **-s de tercera persona**, que es
donde están los errores reales del libro.

## Dos modos

- **🌱 Normal** — tres alternativas, el texto en inglés a la vista y, al fallar,
  la explicación de la regla.
- **🔥 Difícil** — todas las alternativas, **sin ver el texto escrito** (hay que
  entenderlo de oído) y con 3 vidas.

El modo difícil nunca esconde materia nueva: solo quita ayudas.

## Desarrollo

```bash
npm install
npm run dev      # servidor con recarga en vivo
npm run build    # compila a dist/index.html, en UN solo archivo
python verificar.py --todos   # prueba de humo en WebKit y Chromium
python probar_preguntas.py    # que no se repitan preguntas y sean de 2° básico
python probar_preguntas.py --celular   # lo mismo en WebKit a 360px
```

`probar_preguntas.py` juega cada zona varias vueltas y falla si una pregunta se
repite en la misma vuelta, si una alternativa es demasiado larga, si el modo
normal ofrece más de 3 alternativas, si algo desborda a lo ancho o si el botón
"Entendido" queda fuera de pantalla. Además escribe `preguntas.txt` con todas
las preguntas y su respuesta, para revisarlas contra las fotos del libro.

El build produce un único HTML autocontenido a propósito, para que funcione al
abrirlo con doble clic (`file://`), donde los navegadores bloquean los módulos ES.

Ninguna de las dos **comprueba el audio**: los navegadores automatizados no
exponen voces (`probar_preguntas.py` usa una voz muda que solo anota lo que se
le pidió decir). Que suene en inglés se prueba a mano, con `probar-voz.bat`.

Se publica solo en cada push a `master`.
