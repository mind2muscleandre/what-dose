# Next Steps After Schema Implementation

## ✅ Completed
- [x] All SQL schema extensions created and run
- [x] Supabase client utility created (`lib/supabase.ts`)
- [x] TypeScript types created (`lib/database.types.ts`)
- [x] CSV import script created (`scripts/import-supplements.ts`)

## 🔧 Immediate Steps

### 1. Install Supabase Client
```bash
npm install @supabase/supabase-js
```

### 2. Set Up Environment Variables
Make sure your `.env.local` file has:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For CSV import script
```

### 3. Install Additional Dependencies (for CSV import script)
```bash
npm install --save-dev tsx  # For running TypeScript scripts
# OR
npm install --save-dev ts-node typescript @types/node
```

### 4. Import Supplements CSV
```bash
# Using tsx (recommended)
npx tsx scripts/import-supplements.ts "Börja utforska - Börja utforska.csv"

# OR using ts-node
npx ts-node scripts/import-supplements.ts "Börja utforska - Börja utforska.csv"
```

## 📝 Code Updates Needed

### 1. Update Library Component to Use Hierarchical Search
Update `components/whatdose/library.tsx` to:
- Use `search_supplements` RPC function instead of hardcoded data
- Display parent supplements with expandable variants
- Handle the JSONB variants structure from the search results

Example:
```typescript
const { data, error } = await supabase.rpc('search_supplements', {
  search_term: searchQuery
})
```

### 2. Update Components to Use Supabase
Replace any mock data with actual Supabase queries:
- Dashboard: Load real progress metrics from `user_progress_metrics`
- My Stack: Load from `user_stacks` table
- Profile: Load from `profiles` table with gamification data

### 3. Implement Authentication
Add Supabase Auth to your app:
- Create auth context/provider
- Add login/signup pages
- Protect routes that require authentication

### 4. Implement Safety Engine Integration
Create components/utilities for:
- Checking interactions when user adds supplements to stack
- Displaying warnings for dangerous combinations
- Visualizing interaction graph

### 5. Implement Protocols System
Create components for:
- Creating new protocols
- Forking existing protocols
- Sharing protocols with community
- Displaying protocol attribution tree

### 6. Implement N-of-1 Experiments
Create components for:
- Setting up experiments
- Tracking experiment progress
- Displaying statistical results

### 7. Implement Terra API Integration
Create:
- Connection flow UI
- Webhook endpoint (API route)
- Background job processor for webhook staging table

## 🎯 Priority Order

1. **Install dependencies** (Supabase client)
2. **Import supplements CSV** (populate database)
3. **Update Library component** (hierarchical search)
4. **Add authentication** (Supabase Auth)
5. **Connect existing components to database** (Dashboard, My Stack, Profile)
6. **Implement safety engine** (interaction checking)
7. **Implement remaining features** (Protocols, Experiments, Terra)

## 📚 Useful Resources

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 🔍 Testing the Schema

After importing supplements, test the hierarchical search:
```sql
SELECT * FROM search_supplements('Magnesium');
```

This should return parent supplements with aggregated variants as JSONB.
