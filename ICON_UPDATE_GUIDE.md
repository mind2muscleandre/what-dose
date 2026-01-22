# App Ikon Uppdatering Guide

## Steg 1: Spara din bild
Spara bilden du vill använda som app ikon i projektet, t.ex.:
- `public/new-app-icon.png` eller
- `public/new-app-icon.jpg`

## Steg 2: Installera Pillow (om det inte redan är installerat)
```bash
pip3 install Pillow
```

## Steg 3: Generera ikoner
Kör skriptet för att generera alla ikon-storlekar:
```bash
python3 scripts/generate-icons.py public/new-app-icon.png
```

Detta kommer att skapa:
- `icon-192x192.png`
- `icon-512x512.png`
- `apple-icon-180x180.png`
- `apple-icon.png`
- `icon-light-32x32.png`
- `icon-dark-32x32.png`
- `icon.svg`

## Steg 4: Committa och pusha
```bash
git add public/*.png public/*.svg
git commit -m "Update app icons with new design"
git push origin main
```

## Steg 5: Deploya till Vercel
Efter push kommer Vercel automatiskt att deploya, eller:
1. Gå till [Vercel Dashboard](https://vercel.com)
2. Välj ditt projekt
3. Klicka på "Redeploy" om det inte deployas automatiskt

## Alternativ: Använd online verktyg
Om du inte vill installera Pillow, kan du använda online verktyg som:
- [AppIcon.co](https://www.appicon.co/)
- [IconKitchen](https://icon.kitchen/)
- [Favicon.io](https://favicon.io/)

Ladda upp din bild och ladda ner alla storlekar, sedan kopiera dem till `public/` mappen.
