# Environment Variables Setup Guide

## 📋 Översikt

Detta dokument förklarar alla miljövariabler som behövs för WhatDose-appen.

## 🔧 Nödvändiga Miljövariabler

### 1. Supabase Configuration

**Varför behövs det:**
- Supabase används för databas, autentisering och real-time funktioner
- SQL-schemat är designat för Supabase

**Var hittar du värdena:**
1. Gå till [Supabase Dashboard](https://app.supabase.com)
2. Välj ditt projekt (eller skapa ett nytt)
3. Gå till **Settings** → **API**
4. Kopiera **Project URL** och **anon/public key**

**Variabler:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here  # Optional
```

**Förklaring:**
- `NEXT_PUBLIC_SUPABASE_URL`: Din Supabase-projektets URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Publik nyckel (säker att exponera i browser, skyddad av RLS)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (endast för server-side admin operations, ALDRIG exponera i client)

---

### 2. Next.js Configuration

**Variabler:**
```bash
NODE_ENV=development  # eller 'production'
NEXT_PUBLIC_APP_URL=http://localhost:3000  # för lokal utveckling
```

**Förklaring:**
- `NODE_ENV`: Miljö (development/production)
- `NEXT_PUBLIC_APP_URL`: Appens URL (används för redirects, etc.)

---

## 📁 Filstruktur

### `.env.local` (Lokal utveckling)
- **Gitignored** - innehåller dina faktiska nycklar
- Används när du kör `npm run dev` lokalt
- Kopiera från `.env.example` och fyll i dina värden

### `.env.example` (Mall)
- **Committad till git** - innehåller mallar utan faktiska värden
- Visar vilka variabler som behövs
- Används som dokumentation

### `.env.production` (Production - om du kör lokalt)
- För production builds lokalt
- Används när du kör `npm run build && npm start`

---

## 🚀 Setup Steg

### 1. Skapa Supabase Projekt

1. Gå till [supabase.com](https://supabase.com)
2. Skapa ett nytt projekt
3. Vänta tills projektet är klart (tar ~2 minuter)

### 2. Kör SQL Schema

1. Gå till **SQL Editor** i Supabase Dashboard
2. Öppna `complete_schema.sql`
3. Kopiera och kör hela scriptet
4. Verifiera att alla tabeller skapades korrekt

### 3. Konfigurera Environment Variables

1. Kopiera `.env.example` till `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Öppna `.env.local` och fyll i dina Supabase-värden:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Spara filen

### 4. Testa Anslutningen

1. Starta dev-servern:
   ```bash
   npm run dev
   ```

2. Öppna appen i browser: `http://localhost:3000`

3. Kontrollera att inga Supabase-relaterade fel visas i konsolen

---

## 🔒 Säkerhet

### ✅ Säkert att exponera (NEXT_PUBLIC_*)
- `NEXT_PUBLIC_SUPABASE_URL` - Publik URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Skyddad av Row Level Security (RLS)

### ⚠️ ALDRIG exponera
- `SUPABASE_SERVICE_ROLE_KEY` - Bypassar RLS, full access
- Använd endast i API routes eller server components
- Lägg INTE i `NEXT_PUBLIC_*` variabler

### 🛡️ RLS (Row Level Security)
- Alla tabeller har RLS aktiverat
- Användare kan bara se/redigera sina egna data
- `anon` key är säker eftersom RLS skyddar data

---

## 🌍 Deployment (Vercel)

När du deployar till Vercel:

1. Gå till ditt Vercel-projekt
2. Gå till **Settings** → **Environment Variables**
3. Lägg till alla `NEXT_PUBLIC_*` variabler
4. Lägg till `SUPABASE_SERVICE_ROLE_KEY` om du behöver server-side operations
5. Välj rätt miljö (Production, Preview, Development)
6. Redeploy

**Vercel Analytics:**
- Fungerar automatiskt när deployat till Vercel
- Ingen extra konfiguration behövs

### 3. Google Analytics (Optional)

**Varför behövs det:**
- Tracka användaraktivitet och beteende
- Analysera konverteringar och funktioner
- Förbättra användarupplevelsen baserat på data

**Var hittar du värdet:**
1. Gå till [Google Analytics](https://analytics.google.com)
2. Skapa ett nytt GA4 property (eller använd befintligt)
3. Gå till **Admin** → **Data Streams**
4. Välj din stream → Kopiera **Measurement ID** (format: `G-XXXXXXXXXX`)

**Variabel:**
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Förklaring:**
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: Din Google Analytics 4 Measurement ID
- Säker att exponera i browser (publik data)
- Om inget värde anges, kommer Google Analytics inte att laddas

---

## 🐛 Troubleshooting

### "Supabase client not initialized"
- Kontrollera att `.env.local` finns och innehåller rätt värden
- Verifiera att variablerna börjar med `NEXT_PUBLIC_` för client-side
- Starta om dev-servern efter att ha ändrat `.env.local`

### "Invalid API key"
- Kontrollera att du kopierat rätt key från Supabase Dashboard
- Verifiera att det är **anon key** för `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Kontrollera att det inte finns extra mellanslag

### "RLS policy violation"
- Detta är normalt - betyder att RLS fungerar
- Kontrollera att användaren är inloggad
- Verifiera RLS policies i Supabase Dashboard

---

## 📚 Ytterligare Resurser

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

