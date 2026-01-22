# 🧪 Testing Checklist - WhatDose Platform

## 📋 Översikt
Detta dokument innehåller en komplett checklista för att testa alla nya funktioner som implementerats i WhatDose-appen. Gå igenom varje sektion systematiskt och markera när varje test är klart.

---

## ✅ 1. Authentication & User Management

### 1.1 User Registration
- [ ] Navigera till `/auth/signup`
- [ ] Fyll i email och password
- [ ] Verifiera att kontot skapas
- [ ] Kontrollera att användaren redirectas till dashboard efter signup
- [ ] Verifiera i Supabase Dashboard att användaren finns i `auth.users`
- [ ] Kontrollera att en profil skapas i `profiles` tabellen
- [ ] Testa med ogiltig email-format (ska visa fel)
- [ ] Testa med för kort password (ska visa fel)
- [ ] Testa med olika passwords i "confirm password" (ska visa fel)

### 1.2 User Login
- [ ] Navigera till `/auth/login`
- [ ] Logga in med skapat konto
- [ ] Verifiera att login fungerar
- [ ] Kontrollera att användaren redirectas till dashboard
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

### 2.3 Add to Stack from Library
- [ ] Sök på ett supplement
- [ ] Välj en variant (eller parent om ingen variant)
- [ ] Klicka på "Add to Stack" knapp
- [ ] Verifiera att success-meddelande visas
- [ ] Navigera till `/stack` (My Stack)
- [ ] Kontrollera att supplementet finns i stacken
- [ ] Testa att lägga till samma supplement igen (ska hantera duplicat eller visa fel)

### 2.4 Search Performance
- [ ] Testa sökning med debounce (skriv långsamt, verifiera att query inte körs för ofta)
- [ ] Sök på långa queries (ska hantera korrekt)
- [ ] Testa med special characters (t.ex. "B12", "5-HTP")

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

### 3.3 Daily Check-in
- [ ] Verifiera att "Daily Check-in" sektion finns
- [ ] Testa att klicka på check-in knapp (om implementerad)
- [ ] Kontrollera att streak uppdateras

### 3.4 Quick Access
- [ ] Verifiera att quick access länkar fungerar
- [ ] Testa navigering till Library, Stack, Profile från dashboard

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
- [ ] Verifiera att confirmation dialog visas (om implementerad)
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

---

## ✅ 5. Profile

### 5.1 View Profile
- [ ] Navigera till `/profile`
- [ ] Verifiera att användarens information visas:
  - [ ] First name
  - [ ] Email
  - [ ] Streak days
  - [ ] Supplements count
  - [ ] Compliance percentage
- [ ] Kontrollera att data hämtas från databasen korrekt

### 5.2 Edit Profile
- [ ] Navigera till `/profile/edit`
- [ ] Ändra first name
- [ ] Spara ändringar
- [ ] Verifiera att ändringar sparas
- [ ] Gå tillbaka till Profile
- [ ] Kontrollera att nya värdet visas
- [ ] Verifiera i Supabase att `profiles` tabellen uppdateras

### 5.3 Statistics
- [ ] Verifiera att streak_days beräknas korrekt baserat på `daily_task_completions`
- [ ] Kontrollera att supplements_count matchar antal items i `user_stacks`
- [ ] Verifiera att compliance_percentage beräknas korrekt

---

## ✅ 6. Community Stacks

### 6.1 View Community Stacks
- [ ] Navigera till `/community`
- [ ] Verifiera att community stacks visas
- [ ] Kontrollera att varje stack visar:
  - [ ] Stack name/title
  - [ ] Author name
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
- [ ] Verifiera att meddelande visas (för nu: "coming soon")
- [ ] När implementerad: kontrollera att supplements läggs till i user's stack

### 6.4 Share Stack
- [ ] Klicka på "Share" knapp
- [ ] Verifiera att share funktionalitet fungerar (eller "coming soon" meddelande)

---

## ✅ 7. Protocols

### 7.1 View Protocols
- [ ] Navigera till `/protocols`
- [ ] Verifiera att protocols listas
- [ ] Kontrollera att varje protocol visar:
  - [ ] Title
  - [ ] Description
  - [ ] Author name
  - [ ] Like count
  - [ ] Fork count
  - [ ] Public/Private status

### 7.2 Create Protocol
- [ ] Klicka på "Create Protocol" knapp
- [ ] Fyll i protocol information (om modal/form finns)
- [ ] Spara protocol
- [ ] Verifiera att protocol skapas i databasen
- [ ] Kontrollera att det visas i listan

### 7.3 Fork Protocol
- [ ] Klicka på "Fork" för ett protocol
- [ ] Verifiera att forked version skapas
- [ ] Kontrollera att fork count ökar för original
- [ ] Verifiera i Supabase att ny rad skapas i `protocols` med `forked_from_id`

### 7.4 Like Protocol
- [ ] Klicka på "Like" för ett protocol
- [ ] Verifiera att like count ökar
- [ ] Kontrollera i Supabase att like sparas

---

## ✅ 8. N-of-1 Experiments

### 8.1 View Experiments
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

### 8.2 Create Experiment
- [ ] Klicka på "Create Experiment" knapp
- [ ] Fyll i experiment information (om modal/form finns)
- [ ] Välj design type
- [ ] Sätt start och end dates
- [ ] Spara experiment
- [ ] Verifiera att experiment skapas i databasen
- [ ] Kontrollera att det visas i listan

### 8.3 Experiment Progress
- [ ] Verifiera att current_phase beräknas korrekt baserat på datum
- [ ] Kontrollera att progress_percentage beräknas korrekt
- [ ] Testa med experiment som är:
  - [ ] Inte startat än (0% progress)
  - [ ] Pågående (50% progress)
  - [ ] Klart (100% progress)

---

## ✅ 9. Terra API Integration

### 9.1 View Connections
- [ ] Navigera till DNA Connect modal (från Profile eller Settings)
- [ ] Verifiera att supported providers listas:
  - [ ] GARMIN
  - [ ] FITBIT
  - [ ] APPLE_HEALTH
  - [ ] (och andra)
- [ ] Kontrollera att connection status visas (Connected/Disconnected)

### 9.2 Connect Provider
- [ ] Klicka på "Connect" för en provider
- [ ] Verifiera att OAuth flow initieras (eller test endpoint anropas)
- [ ] Efter connection, kontrollera att status ändras till "Connected"
- [ ] Verifiera i Supabase att rad skapas i `terra_connections`

### 9.3 Disconnect Provider
- [ ] Klicka på "Disconnect" för en connected provider
- [ ] Verifiera att connection tas bort
- [ ] Kontrollera i Supabase att raden tas bort från `terra_connections`

### 9.4 Webhook Handling
- [ ] Testa att skicka en test webhook till `/api/terra/webhook`
- [ ] Verifiera att webhook payload sparas i `terra_webhook_staging`
- [ ] Kontrollera att signature valideras korrekt

---

## ✅ 10. Google Analytics

### 10.1 Setup
- [ ] Verifiera att `NEXT_PUBLIC_GA_MEASUREMENT_ID` är satt i `.env.local`
- [ ] Starta dev-servern
- [ ] Öppna browser DevTools → Network tab
- [ ] Verifiera att `gtag/js` script laddas
- [ ] Kontrollera att `gtag('config')` anropas

### 10.2 Page View Tracking
- [ ] Navigera mellan olika sidor
- [ ] Öppna Google Analytics Real-Time view
- [ ] Verifiera att page views trackas korrekt
- [ ] Testa följande sidor:
  - [ ] `/dashboard`
  - [ ] `/library`
  - [ ] `/stack`
  - [ ] `/profile`
  - [ ] `/community`
  - [ ] `/protocols`
  - [ ] `/experiments`

### 10.3 Event Tracking - Authentication
- [ ] Testa sign up
- [ ] Verifiera i GA att "sign_up" event trackas
- [ ] Testa sign in
- [ ] Verifiera i GA att "login" event trackas
- [ ] Testa sign out
- [ ] Verifiera i GA att "logout" event trackas

### 10.4 Event Tracking - Supplements
- [ ] Sök på ett supplement i Library
- [ ] Verifiera i GA att "search" event trackas med query
- [ ] Klicka på ett supplement
- [ ] Verifiera i GA att "view_item" event trackas
- [ ] Lägg till supplement i stack
- [ ] Verifiera i GA att "add_to_cart" event trackas
- [ ] Ta bort supplement från stack
- [ ] Verifiera i GA att "remove_from_cart" event trackas

### 10.5 Event Tracking - Community
- [ ] Klicka på "Like" för en stack
- [ ] Verifiera i GA att "like" event trackas
- [ ] Klicka på "Clone Stack"
- [ ] Verifiera i GA att "clone" event trackas

### 10.6 Event Tracking - Protocols
- [ ] Klicka på "Fork" för ett protocol
- [ ] Verifiera i GA att "fork" event trackas
- [ ] Klicka på "Like" för ett protocol
- [ ] Verifiera i GA att "like" event trackas

### 10.7 Event Tracking - Terra
- [ ] Klicka på "Connect" för en Terra provider
- [ ] Verifiera i GA att "connect" event trackas
- [ ] Klicka på "Disconnect"
- [ ] Verifiera i GA att "disconnect" event trackas

---

## ✅ 11. Data Integrity & Database

### 11.1 Row Level Security (RLS)
- [ ] Logga in som User A
- [ ] Skapa data (stack items, protocols, etc.)
- [ ] Logga ut och logga in som User B
- [ ] Verifiera att User B INTE kan se User A's data
- [ ] Kontrollera att User B bara ser sin egen data

### 11.2 Foreign Key Constraints
- [ ] Försök ta bort ett supplement som används i `user_stacks`
- [ ] Verifiera att constraint förhindrar borttagning (eller cascade fungerar)
- [ ] Testa med protocols som är forked
- [ ] Verifiera att foreign keys fungerar korrekt

### 11.3 Data Consistency
- [ ] Lägg till supplement i stack
- [ ] Ta bort supplement från `supplements` tabellen (om möjligt)
- [ ] Verifiera att stack item hanteras korrekt (NULL eller error)

---

## ✅ 12. UI/UX & Performance

### 12.1 Loading States
- [ ] Verifiera att loading spinners visas när data hämtas
- [ ] Testa med långsam nätverksanslutning
- [ ] Kontrollera att loading states inte blockerar UI

### 12.2 Error Handling
- [ ] Testa med ogiltiga inputs
- [ ] Verifiera att felmeddelanden visas tydligt
- [ ] Testa med Supabase offline (simulera nätverksfel)
- [ ] Kontrollera att error states hanteras gracefully

### 12.3 Responsive Design
- [ ] Testa på mobil (375px width)
- [ ] Testa på tablet (768px width)
- [ ] Testa på desktop (1920px width)
- [ ] Verifiera att alla komponenter är läsbara och användbara

### 12.4 Navigation
- [ ] Testa bottom navigation
- [ ] Verifiera att alla länkar fungerar
- [ ] Kontrollera att active state visas korrekt
- [ ] Testa browser back/forward buttons

---

## ✅ 13. Supplement Logic System (NEW)

### 13.1 Database Schema Verification
- [ ] Verifiera att `scaling_algorithm_type` enum finns i databasen
- [ ] Kontrollera att alla nya kolumner finns i `supplements` tabellen:
  - [ ] `i18n_key`
  - [ ] `scaling_algorithm`
  - [ ] `scaling_base_dose`
  - [ ] `scaling_safe_min`
  - [ ] `scaling_safe_max`
  - [ ] `scaling_gender_male`
  - [ ] `scaling_gender_female`
  - [ ] `contraindications`
  - [ ] `cycling_required`
  - [ ] `cycling_instruction_key`
- [ ] Kontrollera att `health_conditions` kolumn finns i `profiles` tabellen
- [ ] Verifiera att alla index är skapade korrekt
- [ ] Kör `scripts/verify-supplement-logic.sql` och verifiera att allt är OK

### 13.2 Dosage Calculator - Linear Weight Algorithm
- [ ] Testa med supplement som använder `linear_weight` (t.ex. Vitamin D3)
- [ ] Verifiera att dosering beräknas: `base_dose * (user_weight / 75.0)`
- [ ] Testa med användare som väger 50kg (ska ge lägre dos)
- [ ] Testa med användare som väger 100kg (ska ge högre dos)
- [ ] Testa med användare som väger 75kg (ska ge exakt base_dose)
- [ ] Verifiera att resultatet klampar mellan `safe_min` och `safe_max`
- [ ] Testa med användare utan vikt (ska fallback till base_dose)
- [ ] Kontrollera att avrundning fungerar korrekt (IU till 100, mg till 10/50)

### 13.3 Dosage Calculator - Gender Split Algorithm
- [ ] Testa med supplement som använder `gender_split` (t.ex. Magnesium)
- [ ] Verifiera att man får `scaling_gender_male` dos för män
- [ ] Verifiera att kvinna får `scaling_gender_female` dos för kvinnor
- [ ] Testa med användare utan kön (ska fallback till base_dose)
- [ ] Testa med användare med 'other' kön (ska fallback till base_dose)

### 13.4 Dosage Calculator - Fixed Algorithm
- [ ] Testa med supplement som använder `fixed` (t.ex. Ashwagandha)
- [ ] Verifiera att dosering alltid är `base_dose` oavsett vikt/kön
- [ ] Testa med olika användare (ska alltid ge samma dos)

### 13.5 Basic Health Stack Generation
- [ ] Testa med kvinna, 30 år, 65kg
  - [ ] Verifiera att Basic Health Stack inkluderar:
    - [ ] Vitamin D3 (linear_weight)
    - [ ] Omega-3 (linear_weight)
    - [ ] Magnesium (gender_split)
    - [ ] Zinc (gender_split)
    - [ ] Iron (fixed, eftersom kvinna 20-50)
- [ ] Testa med man, 25 år, 80kg
  - [ ] Verifiera att Iron INTE ingår (inte kvinna 20-50)
- [ ] Testa med användare 45 år
  - [ ] Verifiera att CoQ10 ingår (age 40+)
  - [ ] Verifiera att Vitamin K2 ingår (age 40+)
- [ ] Testa med användare 55 år
  - [ ] Verifiera att Iron INTE ingår (age 50+)
  - [ ] Verifiera att CoQ10 och K2 fortfarande ingår

### 13.6 Goal Stack Generation
- [ ] Testa med category 'fitness' och subcategory 'strength'
- [ ] Verifiera att supplements från rätt kategori hämtas
- [ ] Testa med olika experience levels (beginner, intermediate, advanced, biohacker)
- [ ] Verifiera att Red (Experimental) supplements INTE visas för non-biohacker
- [ ] Verifiera att Red (Experimental) supplements VISAS för biohacker
- [ ] Testa med olika kategorier (cognitive, longevity, sleep)

### 13.7 Contraindication Filtering
- [ ] Lägg till 'SSRI' i användarens `health_conditions`
- [ ] Verifiera att 5-HTP filtreras bort (contraindicated with SSRI)
- [ ] Verifiera att SAM-e filtreras bort (om det har SSRI i contraindications)
- [ ] Testa med användare utan health_conditions (ska se alla supplements)
- [ ] Testa med användare med 'Blood Thinners' i health_conditions
- [ ] Verifiera att supplements med 'Blood Thinners' i contraindications filtreras bort

### 13.8 Stack Builder Integration
- [ ] Testa `buildUserStack()` funktionen med komplett profil
- [ ] Verifiera att både Basic Health Stack och Goal Stack genereras
- [ ] Kontrollera att duplicat hanteras korrekt (samma supplement i båda stacks)
- [ ] Verifiera att `saveStackToDatabase()` sparar korrekt
- [ ] Kontrollera att timeline blocks genereras från stacken
- [ ] Testa med tom goalCategory (ska bara ge Basic Health Stack)

### 13.9 Translation System
- [ ] Testa `getSupplementName()` med i18n_key
- [ ] Verifiera att engelska namn visas för 'en' language
- [ ] Verifiera att svenska namn visas för 'sv' language
- [ ] Testa fallback till `name_en`/`name_sv` om i18n_key saknas
- [ ] Testa `getSupplementEffect()` funktionen
- [ ] Testa `getWhyDosage()` funktionen
- [ ] Testa `getSupplementWarning()` för experimental supplements
- [ ] Testa `getCyclingInstruction()` för supplements som kräver cykling

### 13.10 Data Population
- [ ] Kör `scripts/populate-example-supplements.sql`
- [ ] Verifiera att supplements uppdateras korrekt
- [ ] Kontrollera att i18n_keys sätts korrekt
- [ ] Verifiera att scaling_algorithm sätts korrekt
- [ ] Kontrollera att contraindications array sätts korrekt
- [ ] Testa att uppdatera ett supplement manuellt med SQL

### 13.11 Error Handling
- [ ] Testa med supplement som saknar `scaling_base_dose` (ska returnera null)
- [ ] Testa med supplement som saknar `scaling_algorithm` (ska fallback till 'fixed')
- [ ] Testa med ogiltig `scaling_algorithm` (ska fallback till 'fixed')
- [ ] Testa med användare som saknar weight (ska hantera gracefully)
- [ ] Verifiera att felmeddelanden visas om supplement inte hittas
- [ ] Testa med databasfel (simulera offline)

### 13.12 Integration with Existing System
- [ ] Verifiera att befintlig `predefined-stacks.ts` fungerar fortfarande
- [ ] Verifiera att `generateStackFromPredefined()` fungerar fortfarande
- [ ] Testa att användare kan lägga till supplements manuellt (som tidigare)
- [ ] Kontrollera att båda systemen kan användas parallellt
- [ ] Verifiera att onboarding kan använda båda systemen

**Status**: ⏳ Väntar
**Anteckningar**: 
```
[Skriv här vad du hittar under testningen]
```

---

## ✅ 14. Edge Cases & Error Scenarios

### 13.1 Empty States
- [ ] Testa med tom stack (ska visa "empty state" meddelande)
- [ ] Testa med inga community stacks
- [ ] Testa med inga protocols
- [ ] Testa med inga experiments

### 13.2 Large Data Sets
- [ ] Lägg till många supplements i stack (50+)
- [ ] Verifiera att performance är acceptabel
- [ ] Testa sökning med många resultat (100+)
- [ ] Kontrollera att pagination eller virtual scrolling fungerar (om implementerad)

### 13.3 Concurrent Actions
- [ ] Öppna appen i två browser tabs
- [ ] Gör ändringar i en tab
- [ ] Verifiera att andra taben uppdateras (eller hanterar stale data korrekt)

### 13.4 Special Characters
- [ ] Testa sökning med special characters (é, ü, å, etc.)
- [ ] Testa med supplements som har special characters i namn
- [ ] Verifiera att encoding hanteras korrekt

---

## 📝 Notes & Issues

### Issues Found:
```
[Skriv ner alla buggar, problem eller förbättringsförslag här]
```

### Performance Notes:
```
[Notera eventuella performance-problem]
```

### UX Improvements:
```
[Förslag på UX-förbättringar]
```

---

## ✅ Completion Status

**Total Progress:** ___ / 14 sections completed

**Date Completed:** _______________

**Tested By:** _______________

---

## 🚀 Next Steps After Testing

1. Fixa alla kritiska buggar som hittats
2. Implementera förbättringar baserat på feedback
3. Optimera performance för stora data sets
4. Lägg till ytterligare error handling där det behövs
5. Förbättra loading states och empty states
6. Uppdatera dokumentation baserat på testresultat
