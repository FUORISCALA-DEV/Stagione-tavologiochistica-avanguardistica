# Stagione Tavologiochistica Avanguardistica

Versione scomposta e pronta per GitHub Pages.

## Struttura
- `index.html` — struttura dell'app
- `css/app.css` — stile
- `js/app.js` — logica
- `assets/images/` — immagini e loghi
- `assets/audio/` — musica
- `assets/docs/` — PDF scaricabili
- `assets/data/` — eventuali altri asset

## GitHub Pages
Carica il contenuto della cartella nella root del repository, poi:
`Settings → Pages → Deploy from a branch → main → / (root)`.

L'app salva la stagione tramite `localStorage`.

## Per lo sviluppo
Non reincorporare gli asset in Base64: mantieni i percorsi relativi. Parti da `index.html`, `css/app.css` e `js/app.js`.
