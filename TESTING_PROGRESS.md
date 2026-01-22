# 🧪 Testing Progress - WhatDose Platform

## 📋 Testning Startad: 2024-12-19

---

## ✅ 1. Authentication & User Management

### 1.1 User Registration
- [ ] Navigera till `/auth/signup`
- [ ] Fyll i email och password
- [ ] Verifiera att kontot skapas
- [ ] Kontrollera att användaren redirectas till onboarding (inte dashboard)
- [ ] Verifiera i Supabase Dashboard att användaren finns i `auth.users`
- [ ] Kontrollera att en profil skapas i `profiles` tabellen
- [ ] Testa med ogiltig email-format (ska visa fel)
- [ ] Testa med för kort password (ska visa fel)
- [ ] Testa med olika passwords i "confirm password" (ska visa fel)

### 1.2 User Login
- [ ] Navigera till `/auth/login`
- [ ] Logga in med skapat konto
- [ ] Verifiera att login fungerar
- [ ] Kontrollera att användaren redirectas till dashboard (eller onboarding om inte klar)
- [ ] Testa med felaktiga credentials (ska visa fel)
- [ ] Testa med ogiltig email-format (ska visa fel)

### 1.3 User Logout
- [ ] Logga in
- [ ] Navigera till Profile (`/profile`)
- [ ] Klicka på "Logout" knapp
- [ ] Verifiera att användaren loggas ut
- [ ] Kontrollera att användaren redirectas till login
- [ ] Försök navigera till skyddade routes (ska redirecta till login)

### 1.4 Protected Routes
- [ ] Logga ut
- [ ] Försök navigera till `/dashboard` (ska redirecta till `/auth/login`)
- [ ] Försök navigera till `/library` (ska redirecta till `/auth/login`)
- [ ] Försök navigera till `/stack` (ska redirecta till `/auth/login`)
- [ ] Logga in igen
- [ ] Verifiera att alla routes är tillgängliga

**Status**: 🔄 Pågående
**Anteckningar**: 
```
[Skriv här vad du hittar under testningen]
```

---

## ✅ 2. Library - Hierarchical Search

### 2.1 Basic Search
- [ ] Navigera till `/library`
- [ ] Verifiera att sökfältet är synligt
- [ ] Sök på "Magnesium" (ska visa resultat)
- [ ] Sök på "Vitamin" (ska visa flera resultat)
- [ ] Sök på något som inte finns (ska visa "No results")
- [ ] Testa med tom sökning (ska inte visa resultat)

### 2.2 Hierarchical Display
- [ ] Sök på "Magnesium"
- [ ] Verifiera att parent supplement visas
- [ ] Kontrollera att status-indikator (Green/Blue/Red) visas korrekt
- [ ] Klicka på parent för att expandera
- [ ] Verifiera att variants visas (t.ex. "Magnesium Glycinate", "Magnesium Citrate")
- [ ] Testa att kollapsa igen
- [ ] Sök på en specifik variant (t.ex. "Bisglycinat")
- [ ] Verifiera att parent fortfarande visas med varianten

### 2.3 Category Filtering
- [ ] Klicka på en kategori-chip (t.ex. "Health")
- [ ] Verifiera att tillskott filtreras korrekt
- [ ] Kontrollera att kategori-ikoner visas
- [ ] Testa att byta kategori
- [ ] Testa att rensa kategori (sök igen)

### 2.4 Status Filter Tooltip
- [ ] Klicka på "?" knappen vid status filter
- [ ] Verifiera att tooltip visas korrekt
- [ ] Kontrollera att tooltip är synlig på mobil
- [ ] Testa att stänga tooltip

### 2.5 Add to Stack from Library
- [ ] Sök på ett supplement
- [ ] Välj en variant (eller parent om ingen variant)
- [ ] Klicka på "Add to Stack" knapp
- [ ] Verifiera att success-meddelande visas
- [ ] Navigera till `/stack` (My Stack)
- [ ] Kontrollera att supplementet finns i stacken
- [ ] Testa att lägga till samma supplement igen (ska hantera duplicat eller visa fel)

**Status**: ⏳ Väntar
**Anteckningar**: 
```
```

---

## ✅ 3. Dashboard

### 3.1 Progress Metrics
- [ ] Navigera till `/dashboard`
- [ ] Verifiera att progress metrics visas:
  - [ ] Total tasks
  - [ ] Completed tasks
  - [ ] Compliance percentage
  - [ ] Streak days
- [ ] Kontrollera att data laddas korrekt från databasen
- [ ] Verifiera att loading state visas medan data hämtas

### 3.2 Timeline Blocks
- [ ] Verifiera att timeline blocks visas
- [ ] Kontrollera att varje block har:
  - [ ] Tid (t.ex. "Morning", "Evening")
  - [ ] Supplements/tasks listade
  - [ ] Checkboxar för completion
- [ ] Testa att markera en task som completed
- [ ] Verifiera att checkboxen uppdateras
- [ ] Refresh sidan och kontrollera att completion sparas
- [ ] Testa att unchecka en task
- [ ] Verifiera att det sparas korrekt

### 3.3 DNA Helix Progress
- [ ] Markera några tasks som completed
- [ ] Verifiera att DNA helix fylls progressivt
- [ ] Markera alla tasks som completed
- [ ] Kontrollera att DNA helix är helt ifylld

### 3.4 Quick Access
- [ ] Verifiera att quick access länkar fungerar
- [ ] Testa navigering till Library, Stack, Profile från dashboard

**Status**: ⏳ Väntar
**Anteckningar**: 
```
```

---

## ✅ 4. My Stack

### 4.1 View Stack
- [ ] Navigera till `/stack`
- [ ] Verifiera att alla supplements i stacken visas
- [ ] Kontrollera att varje item visar:
  - [ ] Supplement name
  - [ ] Dosage (formaterad korrekt)
  - [ ] Timing (morning/evening/etc)
  - [ ] Edit/Delete knappar
- [ ] Testa med tom stack (ska visa "empty state")

### 4.2 Add to Stack
- [ ] Lägg till ett supplement från Library
- [ ] Navigera till Stack
- [ ] Verifiera att det nya supplementet visas
- [ ] Kontrollera att dosage och timing sparas korrekt

### 4.3 Edit Stack Item
- [ ] Klicka på "Edit" för ett supplement
- [ ] Ändra dosage
- [ ] Ändra timing
- [ ] Spara ändringar
- [ ] Verifiera att ändringar sparas i databasen
- [ ] Refresh sidan och kontrollera att ändringar finns kvar

### 4.4 Remove from Stack
- [ ] Klicka på "Delete" för ett supplement
- [ ] Verifiera att confirmation dialog visas
- [ ] Bekräfta borttagning
- [ ] Kontrollera att supplementet försvinner från listan
- [ ] Verifiera i Supabase att raden tas bort från `user_stacks`

### 4.5 Safety Warnings
- [ ] Lägg till supplements som kan interagera (t.ex. 5-HTP och SSRI, eller Magnesium och Calcium i höga doser)
- [ ] Verifiera att Safety Warnings komponenten visas
- [ ] Kontrollera att warnings visar:
  - [ ] Severity level (Low/Medium/High)
  - [ ] Interacting supplement names
  - [ ] Description av interaktionen
  - [ ] Mechanism
  - [ ] Evidence level
- [ ] Ta bort ett av de interagerande supplementen
- [ ] Verifiera att warning försvinner

### 4.6 Create New Stack
- [ ] Klicka på "Create New Stack" knapp
- [ ] Verifiera att confirmation dialog visas
- [ ] Bekräfta
- [ ] Verifiera att redirect till onboarding sker
- [ ] Testa att skapa ny stack med olika mål
- [ ] Kontrollera att gamla stacken tas bort

**Status**: ⏳ Väntar
**Anteckningar**: 
```
```

---

## ✅ 5. Profile

### 5.1 View Profile
- [ ] Navigera till `/profile`
- [ ] Verifiera att användarens information visas:
  - [ ] First name
  - [ ] Username
  - [ ] Email
  - [ ] Streak days
  - [ ] Supplements count
  - [ ] Compliance percentage
- [ ] Kontrollera att data hämtas från databasen korrekt

### 5.2 Edit Profile
- [ ] Navigera till `/profile/edit`
- [ ] Verifiera att alla fält är ifyllda med korrekt data
- [ ] Ändra first name
- [ ] Ändra username
- [ ] Ändra age
- [ ] Ändra weight
- [ ] Ändra gender
- [ ] Spara ändringar
- [ ] Verifiera att ändringar sparas
- [ ] Gå tillbaka till Profile
- [ ] Kontrollera att nya värden visas
- [ ] Verifiera i Supabase att `profiles` tabellen uppdateras

### 5.3 Statistics
- [ ] Verifiera att streak_days beräknas korrekt baserat på `daily_task_completions`
- [ ] Kontrollera att supplements_count matchar antal items i `user_stacks`
- [ ] Verifiera att compliance_percentage beräknas korrekt

**Status**: ⏳ Väntar
**Anteckningar**: 
```
```

---

## ✅ 6. Community Stacks

### 6.1 View Community Stacks
- [ ] Navigera till `/community`
- [ ] Verifiera att community stacks visas
- [ ] Kontrollera att varje stack visar:
  - [ ] Stack name/title
  - [ ] Author name (username eller first_name)
  - [ ] Supplements list
  - [ ] Like count
  - [ ] Comments (om implementerad)
  - [ ] Share button

### 6.2 Like Stack
- [ ] Klicka på "Like" knapp för en stack
- [ ] Verifiera att like count ökar
- [ ] Kontrollera i Supabase att en rad skapas i `stack_likes`
- [ ] Klicka på "Like" igen (unlike)
- [ ] Verifiera att like count minskar

### 6.3 Clone Stack
- [ ] Klicka på "Clone Stack" knapp
- [ ] Verifiera att supplements läggs till i user's stack
- [ ] Kontrollera att dosering sparas korrekt
- [ ] Navigera till `/stack` och verifiera att tillskotten finns där
- [ ] Testa med stack som har tillskott som inte finns i databasen

### 6.4 Share Stack
- [ ] Klicka på "Share Your Stack" knapp
- [ ] Fyll i titel (obligatoriskt)
- [ ] Fyll i beskrivning (valfritt)
- [ ] Fyll i resultat (valfritt)
- [ ] Klicka på "Share"
- [ ] Verifiera att stacken sparas
- [ ] Kontrollera att stacken visas i community-listan
- [ ] Verifiera i Supabase att rad skapas i `community_stacks`

**Status**: ⏳ Väntar
**Anteckningar**: 
```
```

---

## ✅ 7. Onboarding

### 7.1 Onboarding Flow
- [x] Skapa nytt konto
- [x] Verifiera att redirect till `/onboarding` sker
- [x] Steg 0: Välj mål (Goals)
  - [x] Testa att välja flera mål
  - [x] Testa att välja subkategorier
  - [x] Verifiera att "Basic Health Stack" checkbox är synlig
- [x] Steg 1: Biometrics
  - [x] Fyll i namn
  - [x] Fyll i användarnamn
  - [x] Fyll i ålder
  - [x] Fyll i vikt
  - [x] Välj kön
- [x] Steg 2: Erfarenhetsnivå
  - [x] Välj erfarenhetsnivå
- [x] Klicka på "Next" eller "Finish"
- [x] Verifiera att stack genereras
- [x] Kontrollera att Stack Review visas

### 7.2 Stack Review
- [ ] Verifiera att alla tillskott visas
- [ ] Kontrollera att varje tillskott visar:
  - [ ] Namn
  - [ ] Kategori-baserad bakgrundsfärg
  - [ ] "Why Selected" text (personaliserad)
  - [ ] Benefits (minst 2-3)
  - [ ] Dosage options (Standard, Weight-based, Max)
- [ ] Testa att navigera mellan tillskott
- [ ] Testa att välja olika dosage options
- [ ] Klicka på "Finish"
- [ ] Verifiera att redirect till dashboard sker

### 7.3 Create New Stack (för aktiva användare)
- [ ] Logga in som befintlig användare
- [ ] Navigera till `/stack`
- [ ] Klicka på "Create New Stack"
- [ ] Verifiera att redirect till onboarding sker
- [ ] Testa att skapa ny stack
- [ ] Kontrollera att gamla stacken tas bort

**Status**: ✅ Onboarding Flow klar - Fortsätt med Stack Review
**Anteckningar**: 
```
```

---

## ✅ 8. Protocols

### 8.1 View Protocols
- [ ] Navigera till `/protocols`
- [ ] Verifiera att protocols listas
- [ ] Kontrollera att varje protocol visar:
  - [ ] Title
  - [ ] Description
  - [ ] Author name
  - [ ] Like count
  - [ ] Fork count
  - [ ] Public/Private status

### 8.2 Create Protocol
- [ ] Klicka på "Create" knapp
- [ ] Fyll i protocol information
- [ ] Spara protocol
- [ ] Verifiera att protocol skapas i databasen
- [ ] Kontrollera att det visas i listan

### 8.3 Fork Protocol
- [ ] Klicka på "Fork" för ett protocol
- [ ] Verifiera att forked version skapas
- [ ] Kontrollera att fork count ökar för original
- [ ] Verifiera i Supabase att ny rad skapas i `protocols` med `forked_from_id`

### 8.4 Like Protocol
- [ ] Klicka på "Like" för ett protocol
- [ ] Verifiera att like count ökar
- [ ] Kontrollera i Supabase att like sparas

**Status**: ⏳ Väntar
**Anteckningar**: 
```
```

---

## ✅ 9. N-of-1 Experiments

### 9.1 View Experiments
- [ ] Navigera till `/experiments`
- [ ] Verifiera att experiments listas
- [ ] Kontrollera att varje experiment visar:
  - [ ] Title
  - [ ] Description
  - [ ] Design type (AB, ABAB, etc.)
  - [ ] Start date
  - [ ] End date
  - [ ] Current phase
  - [ ] Progress percentage (progress bar)

### 9.2 Create Experiment
- [ ] Klicka på "Create Experiment" knapp
- [ ] Fyll i experiment information
- [ ] Välj design type
- [ ] Sätt start och end dates
- [ ] Spara experiment
- [ ] Verifiera att experiment skapas i databasen
- [ ] Kontrollera att det visas i listan

### 9.3 Experiment Progress
- [ ] Verifiera att current_phase beräknas korrekt baserat på datum
- [ ] Kontrollera att progress_percentage beräknas korrekt
- [ ] Testa med experiment som är:
  - [ ] Inte startat än (0% progress)
  - [ ] Pågående (50% progress)
  - [ ] Klart (100% progress)

**Status**: ⏳ Väntar
**Anteckningar**: 
```
```

---

## ✅ 10. Supplement Logic System (NEW)

### 10.1 Database Schema Verification
- [ ] Verifiera att `scaling_algorithm_type` enum finns i databasen
- [ ] Kontrollera att alla nya kolumner finns i `supplements` tabellen
- [ ] Kontrollera att `health_conditions` kolumn finns i `profiles` tabellen
- [ ] Verifiera att alla index är skapade korrekt
- [ ] Kör `scripts/verify-supplement-logic.sql` och verifiera att allt är OK

### 10.2 Dosage Calculator - Linear Weight Algorithm
- [ ] Testa med supplement som använder `linear_weight` (t.ex. Vitamin D3)
- [ ] Verifiera att dosering beräknas korrekt: `base_dose * (user_weight / 75.0)`
- [ ] Testa med användare som väger 50kg (ska ge lägre dos)
- [ ] Testa med användare som väger 100kg (ska ge högre dos)
- [ ] Verifiera att resultatet klampar mellan `safe_min` och `safe_max`
- [ ] Testa med användare utan vikt (ska fallback till base_dose)
- [ ] Kontrollera att avrundning fungerar korrekt

### 10.3 Dosage Calculator - Gender Split Algorithm
- [ ] Testa med supplement som använder `gender_split` (t.ex. Magnesium)
- [ ] Verifiera att man får `scaling_gender_male` dos för män
- [ ] Verifiera att kvinna får `scaling_gender_female` dos för kvinnor
- [ ] Testa med användare utan kön (ska fallback till base_dose)

### 10.4 Dosage Calculator - Fixed Algorithm
- [ ] Testa med supplement som använder `fixed` (t.ex. Ashwagandha)
- [ ] Verifiera att dosering alltid är `base_dose` oavsett vikt/kön

### 10.5 Basic Health Stack Generation
- [ ] Testa med kvinna, 30 år, 65kg
  - [ ] Verifiera att Basic Health Stack inkluderar: D3, Omega-3, Magnesium, Zinc, Iron
- [ ] Testa med man, 25 år, 80kg
  - [ ] Verifiera att Iron INTE ingår
- [ ] Testa med användare 45 år
  - [ ] Verifiera att CoQ10 och K2 ingår (age 40+)
- [ ] Testa med användare 55 år
  - [ ] Verifiera att Iron INTE ingår (age 50+)

### 10.6 Goal Stack Generation
- [ ] Testa med category 'fitness' och subcategory 'strength'
- [ ] Verifiera att supplements från rätt kategori hämtas
- [ ] Testa med olika experience levels
- [ ] Verifiera att Red (Experimental) supplements INTE visas för non-biohacker
- [ ] Verifiera att Red (Experimental) supplements VISAS för biohacker

### 10.7 Contraindication Filtering
- [ ] Lägg till 'SSRI' i användarens `health_conditions`
- [ ] Verifiera att 5-HTP filtreras bort
- [ ] Testa med användare utan health_conditions (ska se alla supplements)
- [ ] Testa med användare med 'Blood Thinners' i health_conditions

### 10.8 Stack Builder Integration
- [ ] Testa `buildUserStack()` funktionen med komplett profil
- [ ] Verifiera att både Basic Health Stack och Goal Stack genereras
- [ ] Kontrollera att duplicat hanteras korrekt
- [ ] Verifiera att `saveStackToDatabase()` sparar korrekt
- [ ] Kontrollera att timeline blocks genereras från stacken

### 10.9 Translation System
- [ ] Testa `getSupplementName()` med i18n_key
- [ ] Verifiera att engelska/svenska namn visas korrekt
- [ ] Testa fallback till `name_en`/`name_sv` om i18n_key saknas
- [ ] Testa `getSupplementEffect()`, `getWhyDosage()`, `getSupplementWarning()`

### 10.10 Data Population
- [ ] Kör `scripts/populate-example-supplements.sql`
- [ ] Verifiera att supplements uppdateras korrekt
- [ ] Kontrollera att i18n_keys och scaling_algorithm sätts korrekt

### 10.11 Error Handling
- [ ] Testa med supplement som saknar `scaling_base_dose`
- [ ] Testa med supplement som saknar `scaling_algorithm`
- [ ] Testa med användare som saknar weight
- [ ] Verifiera att felmeddelanden visas korrekt

### 10.12 Integration with Existing System
- [ ] Verifiera att befintlig `predefined-stacks.ts` fungerar fortfarande
- [ ] Testa att användare kan lägga till supplements manuellt
- [ ] Kontrollera att båda systemen kan användas parallellt

**Status**: ⏳ Väntar
**Anteckningar**: 
```
[Skriv här vad du hittar under testningen]
```

---

## ✅ 11. PWA

### 11.1 Installation
- [ ] Öppna appen i Chrome/Edge
- [ ] Verifiera att install-ikon visas i adressfältet
- [ ] Klicka på install-ikon
- [ ] Verifiera att appen installerar
- [ ] Öppna installerad app
- [ ] Kontrollera att appen fungerar offline (cached)

### 11.2 Manifest
- [ ] Öppna Chrome DevTools → Application → Manifest
- [ ] Verifiera att manifest laddas korrekt
- [ ] Kontrollera att alla ikoner finns
- [ ] Verifiera att theme colors är korrekta

### 11.3 Service Worker
- [ ] Öppna Chrome DevTools → Application → Service Workers
- [ ] Verifiera att service worker registreras
- [ ] Kontrollera cache storage
- [ ] Testa offline-funktionalitet

**Status**: ⏳ Väntar
**Anteckningar**: 
```
```

---

## 📝 Issues Found

### Kritiska Buggar:
```
[Lägg till kritiska buggar här]
```

### Mindre Buggar:
```
[Lägg till mindre buggar här]
```

### Förbättringsförslag:
```
[Lägg till förbättringsförslag här]
```

---

## 📊 Testning Sammanfattning

**Startdatum**: 2024-12-19
**Testad av**: _______________
**Totalt antal tester**: ___ / ___ (inkl. Supplement Logic System)
**Godkända**: ___
**Misslyckade**: ___
**Blockade**: ___

---

**Senast Uppdaterad**: 2024-12-19
