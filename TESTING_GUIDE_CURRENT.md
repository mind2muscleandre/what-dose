# 🧪 Current Testing Guide - WhatDose Platform

## 📍 Nuvarande Position
Du har precis klarat av **7.1 Onboarding Flow** och **7.2 Stack Review** (med fixar för benefits och usage notes). Nu ska vi testa **3. Dashboard** och **4. My Stack**.

---

## ✅ 3. Dashboard - Testning Nu

### Steg 1: Navigera till Dashboard
1. **Efter Stack Review**, kontrollera att du redirectas till `/dashboard` (eller `/stack`)
2. **Om du är på `/stack`**, navigera till Dashboard via bottom navigation eller quick access

### Steg 2: Progress Metrics
Verifiera att följande visas korrekt:
- [ ] **Total tasks** - Antal supplements i din stack
- [ ] **Completed tasks** - Antal markerade som klara idag
- [ ] **Compliance percentage** - Procent av completed/total
- [ ] **Streak days** - Antal dagar i rad du har markerat tasks

### Steg 3: Timeline Blocks
Kontrollera att timeline blocks visas korrekt:
- [ ] **Morning** block visas med supplements som har `schedule_block = 'Morning'`
- [ ] **Lunch** block visas (om du har supplements för lunch)
- [ ] **Pre-Workout** block visas (om du har pre-workout supplements)
- [ ] **Post-Workout** block visas (om du har post-workout supplements)
- [ ] **Dinner** block visas (om du har dinner supplements)
- [ ] **Bedtime** block visas med supplements som har `schedule_block = 'Bedtime'`

För varje block, kontrollera:
- [ ] **Tid visas korrekt** (t.ex. "Morning", "Evening")
- [ ] **Supplements listade** med namn och dosering
- [ ] **Checkboxar** för completion syns för varje supplement

### Steg 4: Task Completion
- [ ] **Markera en task som completed** (klicka på checkbox)
- [ ] **Verifiera** att checkboxen uppdateras visuellt
- [ ] **Refresh sidan** (F5 eller reload)
- [ ] **Kontrollera** att completion sparas (checkboxen är fortfarande ikryssad)
- [ ] **Unchecka en task** (klicka igen)
- [ ] **Verifiera** att det sparas korrekt (checkboxen är fortfarande avmarkerad efter refresh)

### Steg 5: DNA Helix Progress
- [ ] **Markera några tasks** som completed
- [ ] **Verifiera** att DNA helix fylls progressivt (visuell animation)
- [ ] **Markera alla tasks** som completed
- [ ] **Kontrollera** att DNA helix är helt ifylld (100%)

### Steg 6: Quick Access
- [ ] **Testa navigering** till Library från dashboard
- [ ] **Testa navigering** till Stack från dashboard
- [ ] **Testa navigering** till Profile från dashboard
- [ ] **Verifiera** att alla länkar fungerar korrekt

---

## ✅ 4. My Stack - Testning Efter Dashboard

### Steg 1: View Stack
- [ ] **Navigera till `/stack`**
- [ ] **Verifiera** att alla supplements i stacken visas
- [ ] **Kontrollera** att varje item visar:
  - [ ] Supplement name (på engelska)
  - [ ] Dosage (formaterad korrekt, t.ex. "5g" inte "5000g")
  - [ ] Timing (morning/evening/etc)
  - [ ] Edit/Delete knappar
- [ ] **Testa med tom stack** (om du tar bort alla) - ska visa "empty state" meddelande

### Steg 2: Add to Stack
- [ ] **Navigera till Library** (`/library`)
- [ ] **Sök på ett supplement** (t.ex. "Magnesium")
- [ ] **Välj en variant** (eller parent om ingen variant)
- [ ] **Klicka på "Add to Stack"** knapp
- [ ] **Verifiera** att success-meddelande visas
- [ ] **Navigera till `/stack`**
- [ ] **Kontrollera** att det nya supplementet visas
- [ ] **Verifiera** att dosage och timing sparas korrekt

### Steg 3: Edit Stack Item
- [ ] **Klicka på "Edit"** för ett supplement
- [ ] **Ändra dosage** (t.ex. från 5g till 3g)
- [ ] **Ändra timing** (t.ex. från Morning till Evening)
- [ ] **Spara ändringar**
- [ ] **Verifiera** att ändringar sparas i databasen (uppdateras i UI)
- [ ] **Refresh sidan** (F5)
- [ ] **Kontrollera** att ändringar finns kvar

### Steg 4: Remove from Stack
- [ ] **Klicka på "Delete"** för ett supplement
- [ ] **Verifiera** att confirmation dialog visas
- [ ] **Bekräfta borttagning**
- [ ] **Kontrollera** att supplementet försvinner från listan
- [ ] **Verifiera i Supabase** (om möjligt) att raden tas bort från `user_stacks`

### Steg 5: Safety Warnings
- [ ] **Lägg till supplements** som kan interagera (t.ex. 5-HTP och SSRI, eller Magnesium och Calcium i höga doser)
- [ ] **Verifiera** att Safety Warnings komponenten visas
- [ ] **Kontrollera** att warnings visar:
  - [ ] Severity level (Low/Medium/High)
  - [ ] Interacting supplement names
  - [ ] Description av interaktionen
  - [ ] Mechanism
  - [ ] Evidence level
- [ ] **Ta bort ett av de interagerande supplementen**
- [ ] **Verifiera** att warning försvinner

### Steg 6: Create New Stack
- [ ] **Klicka på "Create New Stack"** knapp
- [ ] **Verifiera** att confirmation dialog visas
- [ ] **Bekräfta**
- [ ] **Verifiera** att redirect till onboarding sker
- [ ] **Testa att skapa ny stack** med olika mål
- [ ] **Kontrollera** att gamla stacken tas bort

---

## 🔍 Viktiga Saker att Kolla

### Data Consistency
- [ ] Timeline blocks matchar stack items
- [ ] Completion status synkas mellan Dashboard och Stack
- [ ] Streak days beräknas korrekt baserat på `daily_task_completions`

### UI/UX
- [ ] Loading states visas när data hämtas
- [ ] Error states hanteras gracefully
- [ ] Responsive design fungerar på mobil/tablet/desktop

### Performance
- [ ] Dashboard laddas snabbt även med många supplements
- [ ] Task completion uppdateras snabbt (ingen fördröjning)

---

## 📝 Nästa Steg Efter Dashboard & My Stack

Efter att ha testat Dashboard och My Stack, fortsätt med:

1. **✅ 2. Library** - Testa sökning och filtrering
2. **✅ 6. Community** - Testa att dela stack och klona stacks
3. **✅ 5. Profile** - Testa profilhantering

---

**Börja med att testa Dashboard nu!** 🚀
