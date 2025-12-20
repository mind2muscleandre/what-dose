# 🚀 Quick Start Guide - WhatDose

## Snabb Setup (5 minuter)

### 1. Installera Dependencies
```bash
npm install
```

### 2. Skapa Supabase Projekt
1. Gå till [supabase.com](https://supabase.com) och skapa ett nytt projekt
2. Vänta tills projektet är klart (~2 minuter)

### 3. Kör SQL Schema
1. I Supabase Dashboard → **SQL Editor**
2. Öppna `complete_schema.sql`
3. Kopiera och kör hela scriptet
4. Verifiera att tabellerna skapades

### 4. Konfigurera Environment Variables
```bash
# Kopiera mall-filen
cp env.example .env.local

# Öppna .env.local och fyll i dina Supabase-värden
# Hitta dem här: https://app.supabase.com/project/YOUR_PROJECT/settings/api
```

**Minimum som behövs:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Starta Appen
```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000) i din browser.

---

## 📋 Checklista

- [ ] Dependencies installerade (`npm install`)
- [ ] Supabase projekt skapat
- [ ] SQL schema kört (`complete_schema.sql`)
- [ ] `.env.local` skapad med Supabase-värden
- [ ] Appen startar utan fel (`npm run dev`)

---

## 🔍 Var hittar jag mina Supabase-nycklar?

1. Gå till [Supabase Dashboard](https://app.supabase.com)
2. Välj ditt projekt
3. Gå till **Settings** (⚙️) → **API**
4. Kopiera:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 📚 Mer Information

- **Detaljerad setup:** Se `ENV_SETUP.md`
- **SQL schema info:** Se `SQL_SCHEMA_ANALYSIS.md`
- **Komplett schema:** Se `complete_schema.sql`

---

## 🐛 Problem?

### "Cannot find module"
→ Kör `npm install`

### "Supabase client not initialized"
→ Kontrollera att `.env.local` finns och innehåller rätt värden
→ Starta om dev-servern

### "Invalid API key"
→ Verifiera att du kopierat rätt key från Supabase Dashboard
→ Kontrollera att det inte finns extra mellanslag

---

## ✅ Klar!

Nu borde allt fungera. Testa att:
1. Öppna landningssidan
2. Gå igenom onboarding
3. Se dashboard med timeline blocks

