# Deployment Instruktioner för Live Version

## Problem: Ändringar synliga lokalt men inte på live-versionen

Detta händer vanligtvis när:
1. Ändringar inte är pushat till GitHub
2. Vercel inte har deployat automatiskt
3. Cache-problem

## Lösning:

### 1. Verifiera att allt är pushat
```bash
git status
git log --oneline -3
```

### 2. Om det finns ändringar som inte är pushat:
```bash
git add .
git commit -m "Update dashboard and other changes"
git push origin main
```

### 3. Trigga ny deployment på Vercel

**Automatisk deployment:**
- Om Vercel är kopplat till GitHub, ska den automatiskt deploya när du pushar
- Vänta 1-2 minuter efter push

**Manuell deployment:**
1. Gå till [Vercel Dashboard](https://vercel.com/dashboard)
2. Välj ditt projekt (what-dose)
3. Klicka på "Deployments" tab
4. Klicka på "Redeploy" på den senaste deploymenten
5. Eller klicka på "Deploy" → "Deploy Latest Commit"

### 4. Rensa cache (om problemet kvarstår)
I Vercel Dashboard:
1. Gå till ditt projekt
2. Settings → General
3. Scrolla ner till "Clear Build Cache"
4. Klicka på "Clear Build Cache"
5. Redeploy

### 5. Verifiera deployment
- Kolla Vercel deployment logs för fel
- Verifiera att build lyckades
- Testa live-versionen efter deployment

## För App Ikon Uppdatering:

1. Spara din bild som `public/new-icon.png`
2. Installera Pillow: `pip3 install Pillow` (eller använd online verktyg)
3. Kör: `python3 scripts/generate-icons.py public/new-icon.png`
4. Committa och pusha
5. Vercel kommer automatiskt att deploya
