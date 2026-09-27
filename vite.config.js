import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Empaqueta el JS y el CSS DENTRO del index.html.
 *
 * Por que hace falta: los navegadores bloquean <script type="module"> cuando
 * la pagina se abre con doble clic (protocolo file://) — es una regla de
 * seguridad, no un error del codigo. El resultado era una pagina en blanco.
 * Metiendo todo en un solo archivo, el juego abre con doble clic sin servidor.
 *
 * Efecto secundario util: `dist/index.html` es UN archivo. Se puede copiar a
 * un pendrive o mandar por correo y funciona igual.
 */
function todoEnUno() {
  return {
    name: 'todo-en-uno',
    enforce: 'post',
    generateBundle(_opciones, paquete) {
      let html = paquete['index.html'];
      if (!html) return;
      let codigo = html.source;

      for (const [nombre, archivo] of Object.entries(paquete)) {
        if (nombre === 'index.html') continue;

        if (nombre.endsWith('.js')) {
          // Sin type="module": en file:// los modulos quedan bloqueados.
          //
          // El reemplazo va como FUNCION, no como cadena. Si fuera cadena,
          // replace() interpretaria los patrones de dolar que el codigo
          // compilado trae dentro de sus plantillas, y pegaria pedazos del HTML
          // en medio del JavaScript. Sintoma: "Unexpected token <" y pagina en
          // blanco, solo en algunos juegos, segun que cadena aparezca primero.
          codigo = codigo.replace(
            new RegExp(`<script[^>]*src="[^"]*${nombre.split('/').pop()}"[^>]*></script>`),
            () => `<script>\n${archivo.code}\n</script>`,
          );
          delete paquete[nombre];
        } else if (nombre.endsWith('.css')) {
          codigo = codigo.replace(
            new RegExp(`<link[^>]*href="[^"]*${nombre.split('/').pop()}"[^>]*>`),
            () => `<style>\n${archivo.source}\n</style>`,
          );
          delete paquete[nombre];
        }
      }
      html.source = codigo;
    },
  };
}

// base:'./' mantiene el juego funcionando tambien si algun dia se publica
// en GitHub Pages, que sirve desde un subdirectorio.
export default defineConfig({
  base: './',
  plugins: [todoEnUno()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 100000000, // que ningun recurso quede como archivo aparte
    cssCodeSplit: false,
    // 'iife' envuelve todo en una funcion clasica, sin sentencias import/export.
    // Es lo que permite ejecutarlo en un <script> normal desde file://.
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        manualChunks: undefined,
      },
    },
  },
});
