export type Language = "en" | "sv"

export const translations = {
  en: {
    // Dashboard
    appName: "WhatDose",
    dailyStreak: "Daily Streak",
    myDailyCheckIn: "My Daily Check-in",
    todaysTasks: "Today's Tasks",
    myStack: "My Stack.",
    searchDatabase: "Search Database.",
    logEffect: "Log Effect.",
    refill: "Refill.",

    // Landing Page
    loginButton: "Log in",
    usedByBiohackers: "Used by 10,000+ biohackers",
    heroTitle: "Stop Guessing With Your",
    heroTitleHighlight: "Biology.",
    heroDescription: "The first AI-driven dosage protocol based on",
    heroDescriptionBold: "500+ clinical trials.",
    heroDescriptionContinued: "Optimize your stack. Eliminate risks. Feel the difference in 7 days.",
    ctaButton: "Get My Free Protocol",
    ctaSubtext: "No credit card required • Takes 2 minutes",

    // Old Way vs New Way Section
    oldWayVsNewWayTitle: "Most People Are Doing It Wrong",
    oldWayTitle: "The Old Way",
    newWayTitle: "The WhatDose Way",
    oldWayItem1: "Random pills from Instagram ads",
    oldWayItem2: "Expensive urine ($100s wasted)",
    oldWayItem3: "Unknown interactions",
    oldWayItem4: "Guessing doses from Reddit",
    newWayItem1: "AI-analyzed from 500+ peer-reviewed studies",
    newWayItem2: "Personalized to your biology & goals",
    newWayItem3: "Interaction warnings in real-time",
    newWayItem4: "Exact timing & dosing protocols",
    oldWayVsNewWayDescription:
      "Most people take supplements blindly. They waste $100s a month on stuff that doesn't work—or worse, cancels each other out. WhatDose fixes this instantly.",

    // Interactive Feature Showcase
    interactiveFeatureShowcaseTitle: "Everything You Need In One Place",
    interactiveFeatureShowcaseDescription: "Stop juggling 10 tabs. Get answers in seconds.",

    // Feature 1: Database
    feature1Title: "The Database",
    feature1Description: "Search 200+ supplements with instant evidence ratings.",
    searchPlaceholder: "Search supplements...",
    feature1Status: "Green Status: Verified",
    feature1Supplement: "Creatine Monohydrate",
    feature1Dose: "5g daily",

    // Feature 2: Interaction Shield
    feature2Title: "Interaction Shield",
    feature2Description: "Real-time warnings for dangerous combinations.",
    feature2Warning: "Timing Conflict Detected",
    feature2Rescheduling: "Rescheduling Zinc to morning...",

    // Feature 3: Gamification
    feature3Title: "Daily Streak",
    feature3Description: "Track adherence. Build the habit. See results.",
    feature3DayStreak: "Day Streak",
    feature3Consistency: "Consistency",
    feature3Progress: "Progress",

    // Social Proof
    socialProofTitle: "Real People. Real Results.",
    testimonial1Name: "Marcus J.",
    testimonial1Role: "Entrepreneur",
    testimonial1Text:
      "Finally stopped wasting money on supplements that don't work together. My energy is through the roof.",
    testimonial2Name: "Emma S.",
    testimonial2Role: "Fitness Coach",
    testimonial2Text: "The interaction checker alone saved me from a bad combination. This app is a game-changer.",
    testimonial3Name: "Johan K.",
    testimonial3Role: "Software Developer",
    testimonial3Text: "I've tried every supplement app. WhatDose is the only one backed by actual science.",

    // Final CTA
    finalCTATitle: "Ready to Optimize Your Biology?",
    finalCTADescription: "Join 10,000+ biohackers who stopped guessing and started optimizing.",
    finalCTAButton: "Start Your Free Analysis",
    finalCTASubtext: "100% Free • No Card Required • Instant Access",

    // Onboarding
    step: "Step",
    of: "of",
    goalsTitle: "What are your goals?",
    goalsDescription: "Select one or more areas you want to optimize.",
    fitnessPerformance: "Fitness & Performance",
    fitnessPerformanceSubcategory: "Choose your focus:",
    fitnessPerformanceStrength: "Strength & Power",
    fitnessPerformanceHypertrophy: "Muscle Growth",
    fitnessPerformanceEndurance: "Endurance & Cardio",
    fitnessPerformanceRecovery: "Recovery",
    cognitiveFocus: "Cognitive Focus",
    cognitiveSubcategory: "Choose your focus:",
    cognitiveFocusMemory: "Memory & Learning",
    cognitiveFocusFocus: "Focus & Concentration",
    cognitiveFocusMood: "Mood & Well-being",
    cognitiveFocusProductivity: "Productivity",
    longevity: "Longevity",
    longevitySubcategory: "Choose your focus:",
    longevityAntiAging: "Anti-Aging",
    longevityHealthspan: "Healthspan",
    longevityEnergy: "Cellular Energy",
    longevityLongevity: "Longevity Optimization",
    sleep: "Sleep",
    sleepSubcategory: "Choose your focus:",
    sleepQuality: "Sleep Quality",
    sleepDuration: "Sleep Duration",
    sleepDeepSleep: "Deep Sleep",
    sleepFallingAsleep: "Falling Asleep",

    biometricsTitle: "Your Biometrics",
    biometricsDescription: "Used to calculate personalized doses.",
    age: "Age",
    weight: "Weight",
    gender: "Gender",
    male: "Male",
    female: "Female",
    other: "Other",

    experienceTitle: "Experience Level",
    experienceDescription: "How familiar are you with supplementation?",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    biohacker: "Biohacker",

    experienceDescriptions: [
      "We'll start with basic supplements and simple routines.",
      "You'll get access to more supplements and detailed information.",
      "Advanced stacks and timing optimization included.",
      "Full access to all features and experimental protocols.",
    ],

    back: "Back",
    continue: "Continue",
    startAnalysis: "Start Analysis",
    analyzing: "Analyzing...",
    creatingPlan: "Creating your personalized supplement plan",
    calculatingDoses: "Calculating optimal doses",
    
    // Create New Stack
    createNewStack: "Create New Stack",
    createNewStackDescription: "Create a new stack based on your updated goals",
    createNewStackButton: "Create New Stack",
    newStackCreated: "New stack created successfully!",
    replacingCurrentStack: "This will replace your current stack. Continue?",
    confirmReplace: "Yes, Replace Stack",
    cancel: "Cancel",
    quickStackBuilder: "Quick Stack Builder",
    quickStackDescription: "Select your goals and we'll create a personalized stack for you",
    skipOnboarding: "Skip Full Setup",
    useFullOnboarding: "Use Full Onboarding",

    // Daily Check-in
    checkInTitle: "Daily Check-in",
    sleepQuality: "Sleep Quality",
    energyLevel: "Energy Level",
    sideEffects: "Side Effects",
    adherence: "Adherence",

    poorSleep: "Poor",
    okSleep: "OK",
    goodSleep: "Good",
    excellentSleep: "Excellent",

    low: "Low",
    medium: "Medium",
    high: "High",
    veryHigh: "Very High",

    none: "None",
    nausea: "Nausea",
    headache: "Headache",
    jitters: "Jitters",
    digestive: "Digestive",
    insomnia: "Insomnia",

    checkInComplete: "Check-in Complete!",
    checkInThankYou: "Thank you for completing your daily check-in.",

    // Task List
    taskCompleted: "Task completed",
    taskPending: "Task pending",

    // Daily Check-in (chat)
    dailyAnalysis: "Daily Analysis",
    goodMorning: "Good morning",
    howWasSleep: "How was your sleep quality last night?",
    howIsEnergy: "How does your energy level feel right now?",
    anySideEffects: "Any notable side effects from your stack?",
    seeMissing: "I see you still have",
    inYourList: "in your list. Did you take it?",

    yesTookIt: "Yes, just took it",
    noSkipping: "No, skipping",
    remindLater: "Remind later",

    confirm: "Confirm",
    continueBtn: "Continue",
    close: "Close",

    checkInCompleteTitle: "Check-in Complete",

    lowSluggish: "Low/Sluggish",
    stable: "Stable",
    highPumped: "High/Pumped",
    jitteryStressed: "Jittery/Stressed",

    noneOption: "None",
    stomachIssues: "Stomach Issues",
    headacheOption: "Headache",
    nauseaOption: "Nausea",
    heartPalpitations: "Heart Palpitations",

    goodSleepSummary: "good sleep",
    okaySleepSummary: "okay sleep",
    poorSleepSummary: "poor sleep",
    noSideEffectsSummary: "no side effects",
    someSideEffectsSummary: "some",

    summaryPrefix: "Noted.",
    summarySuffix: "energy and",
    summaryEnd: "We're tracking your progress!",

    // Library
    libraryTitle: "Library",
    searchSupplementsPlaceholder: "Search for supplement (e.g. Creatine)...",
    all: "All",
    muscles: "Muscles",
    cognitive: "Cognitive",
    stress: "Stress",
    proven: "Proven",
    emerging: "Emerging",
    description: "Description",
    recommendedDose: "Recommended Dose",
    interactions: "Interactions",
    addToStack: "Add to My Stack",
    greenStatus: "Proven",

    // Supplement names
    creatineMonohydrate: "Creatine Monohydrate",
    omega3FishOil: "Omega-3 Fish Oil",
    magnesiumGlycinate: "Magnesium Glycinate",
    ashwagandha: "Ashwagandha",

    // Supplement descriptions
    creatineDesc: "One of the most studied supplements. Increases muscle mass, strength and cognitive function.",
    omega3Desc: "Essential fatty acids for heart health, brain function and inflammation.",
    magnesiumDesc: "Important mineral for sleep, muscle relaxation and nerve function.",
    ashwagandhaDesc: "Adaptogen that can reduce stress and improve sleep quality.",

    // Dosing notes
    creatineDosing: "Loading phase not necessary. Consistent 5g daily is sufficient.",
    omega3Dosing: "Take with fat-containing meal for better absorption.",
    magnesiumDosing: "Take in evening for best sleep effect. Glycinate is gentle on stomach.",
    ashwagandhaDosing: "Effects noticed after 4-8 weeks of consistent use.",

    // Interactions
    creatineInteraction1: "Caffeine may temporarily reduce effect",
    creatineInteraction2: "Safe to combine with most supplements",
    omega3Interaction1: "May enhance blood thinning medications",
    omega3Interaction2: "High dose vitamin E should be avoided",
    magnesiumInteraction1: "Avoid taking simultaneously with calcium",
    magnesiumInteraction2: "May interact with certain antibiotics",
    ashwagandhaInteraction1: "May enhance calming medications",
    ashwagandhaInteraction2: "Avoid with thyroid issues without doctor consultation",

    // Community
    communityTitle: "Community",
    discoverStacks: "Discover stacks that work",
    result: "Result",
    cloneStack: "Clone Stack",

    // Community data
    deepSleepStack: "Deep Sleep Stack",
    increasedDeepSleep: "Increased deep sleep by 20%",
    focusProtocol: "Focus Protocol",
    deepWorkDaily: "4+ hours deep work daily",
    recoveryMax: "Recovery Max",
    reducedDOMS: "Reduced DOMS by 50%",

    // Profile
    profileTitle: "Profile",
    editProfile: "Edit Profile",
    profileUpdated: "Profile updated successfully!",
    saving: "Saving...",
    errorUpdatingProfile: "Failed to update profile",
    namePlaceholder: "Enter your name",
    username: "Username",
    usernamePlaceholder: "Choose a username",
    usernameDescription: "This will be shown in the community",
    emailCannotBeChanged: "Email cannot be changed",
    notifications: "Notifications",
    appearance: "Appearance",
    privacy: "Privacy",
    helpSupport: "Help & Support",
    logout: "Log Out",
    dnaProfile: "DNA Profile",
    notConnected: "Not connected",
    connect: "Connect",
    daysStreak: "Days Streak",
    supplements: "Supplements",
    compliance: "Compliance",

    // Bottom Navigation
    home: "Home",
    library: "Library",
    community: "Community",
    profile: "Profile",
    
    // My Stack
    addSupplement: "Add Supplement",
    emptyStack: "Your stack is empty",
    emptyStackDescription: "Add supplements from the library to get started",
    browseLibrary: "Browse Library",
    syncToTasks: "Sync to Tasks",
    syncingTimeline: "Syncing...",
    timelineSynced: "Timeline synced successfully! Refresh the page to see your tasks.",
    
    // Stack Review
    hereIsYourStack: "Here's Your Stack",
    stackReviewDescription: "Let's review each supplement and why it was selected for you",
    whySelected: "Why Selected",
    benefits: "Benefits",
    dosageOptions: "Dosage Options",
    dosageOptionsDescription: "This is the standard recommended dose, but some people take different amounts. Would you like to try a different dose?",
    standardDose: "Standard Dose",
    standardDoseDescription: "The most common recommended dose",
    weightBasedDose: "Weight-Based Dose",
    weightBasedDoseDescription: "Personalized dose based on your weight ({weight}kg)",
    lowDose: "Low Dose",
    lowDoseDescription: "A lower dose for sensitivity or starting out",
    highDose: "High Dose",
    highDoseDescription: "A higher dose for enhanced effects",
    maxDose: "Maximum Dose",
    maxDoseDescription: "The maximum recommended dose",
    cognitiveDose: "Cognitive Dose",
    cognitiveDoseCreatineDescription: "Higher dose (up to 20g/day) that may provide additional cognitive benefits including improved memory, mental clarity, and brain energy",
    previous: "Previous",
    next: "Next",
    finish: "Finish",
    
    // Supplement-specific explanations
    whyCreatine: "Creatine is one of the most researched supplements for muscle growth and strength. It's especially effective for hypertrophy training.",
    benefitCreatine1: "Increases muscle strength and power output",
    benefitCreatine2: "Enhances muscle growth and recovery",
    benefitCreatine3: "Supports ATP production for better workouts",
    
    whyEAA: "Essential Amino Acids (EAA) are crucial for muscle protein synthesis. They're more complete than BCAA and better for muscle growth.",
    benefitEAA1: "Stimulates muscle protein synthesis (mTOR activation)",
    benefitEAA2: "Supports muscle recovery and growth",
    benefitEAA3: "Complete amino acid profile for optimal results",
    
    whyCaffeine: "Caffeine is placed in Pre-Workout to maximize performance during training. 200-300mg is the optimal range for most people.",
    benefitCaffeine1: "Increases energy and alertness",
    benefitCaffeine2: "Enhances physical performance and endurance",
    benefitCaffeine3: "Improves focus and mental clarity",
    
    whyBCAA: "Branched Chain Amino Acids support muscle recovery and reduce fatigue during workouts.",
    benefitBCAA1: "Reduces muscle fatigue during training",
    benefitBCAA2: "Supports muscle recovery",
    
    whyALCAR: "Acetyl-L-Carnitine supports cognitive function and energy metabolism.",
    benefitALCAR1: "Enhances cognitive function and focus",
    benefitALCAR2: "Supports energy metabolism",
    
    whyBacopa: "Bacopa Monnieri is a well-researched nootropic that supports memory and cognitive function.",
    benefitBacopa1: "Improves memory and learning",
    benefitBacopa2: "Reduces anxiety and stress",
    
    whyDefault: "This supplement was selected based on your goals and subcategories to support your objectives.",
    benefitDefault1: "Supports your selected goals",
    benefitDefault2: "Based on scientific research",
    benefitDefault3: "Well-tolerated and safe for most people",
    
    // Goal-specific explanations
    whyCreatineForFitness: "Creatine was selected for your {goals} goals. It's one of the most researched supplements for muscle growth and strength, especially effective for hypertrophy training.",
    whyEAAForFitness: "EAA (Essential Amino Acids) was selected for your {goals} goals. They're crucial for muscle protein synthesis and more complete than BCAA for muscle growth.",
    whyCaffeineForGoals: "Caffeine was selected for your {goals} goals. It's placed in Pre-Workout to maximize performance during training, with 200-300mg being the optimal range.",
    whyBCAAForFitness: "BCAA was selected for your {goals} goals. They support muscle recovery and reduce fatigue during workouts.",
    whyALCARForCognitive: "ALCAR (Acetyl-L-Carnitine) was selected for your {goals} goals. It supports cognitive function, focus, and energy metabolism.",
    whyBacopaForCognitive: "Bacopa Monnieri was selected for your {goals} goals. It's a well-researched nootropic that supports memory, learning, and reduces anxiety.",
    whyDHF: "7,8-Dihydroxyflavone (7,8-DHF) is a flavonoid that acts as a TrkB agonist, supporting brain-derived neurotrophic factor (BDNF) signaling.",
    whyDHFForCognitive: "7,8-Dihydroxyflavone was selected for your {goals} goals. It supports cognitive function, memory, and neuroplasticity through BDNF activation.",
    benefitDHF1: "Enhances BDNF signaling for neuroplasticity",
    benefitDHF2: "Supports memory formation and learning",
    benefitDHF3: "May improve cognitive performance",
    
    // Generic personalized explanations
    whySelectedForGoals: "{name} was selected because you chose {goals} as your goals. This supplement is specifically beneficial for these objectives.",
    whySelectedForCategories: "{name} was selected because it supports {categories}, which align with your goals.",
    whyDefaultGeneric: "{name} was selected based on your goals and subcategories to support your objectives.",
    yourGoals: "your goals",
    
    // Category-based generic benefits (for supplements without specific benefits)
    benefitHealth1: "Supports overall health and wellness",
    benefitMuscle1: "Promotes muscle growth and recovery",
    benefitPerformance1: "Enhances physical performance and endurance",
    benefitFocus1: "Improves cognitive function and mental clarity",
    benefitStress1: "Helps manage stress and supports mood",
    benefitMetabolic1: "Supports healthy metabolism and energy production",
    benefitSleep1: "Promotes restful sleep and recovery",
    benefitAntiAging1: "Supports cellular health and longevity",
    benefitJoints1: "Supports joint health and mobility",
    
    // Category names
    categoryHealth: "Health",
    categoryMuscle: "Muscle",
    categoryPerformance: "Performance",
    categoryFocus: "Focus",
    categoryStress: "Stress",
    categoryMetabolic: "Metabolic",
    categorySleep: "Sleep",
    categoryAntiAging: "Anti-Aging",
    categoryJoints: "Joints",
    
    // Library filters
    filterByCategory: "Filter by Category",
    filterByStatus: "Filter by Status",
    selectCategoryOrSearch: "Select a category above or type at least 2 characters to search...",
    noSupplementsFound: "No supplements found",
    
    // Share Stack
    shareYourStack: "Share Your Stack",
    stackTitle: "Stack Title",
    stackTitlePlaceholder: "e.g., My Hypertrophy Stack",
    stackDescriptionPlaceholder: "Describe your stack and why you use it...",
    stackResultsPlaceholder: "What results have you achieved with this stack?",
    stackPreview: "Your stack includes:",
    moreSupplements: "more supplements",
    share: "Share",
    sharing: "Sharing...",
    stackSharedSuccessfully: "Your stack has been shared successfully!",
    errorSharingStack: "Failed to share stack",
    emptyStackCannotShare: "Your stack is empty. Add supplements to your stack first.",
    shareTitleRequired: "Please enter a title for your stack",
    optional: "Optional",
    pleaseSignIn: "Please sign in to share your stack",
    confirmDeleteSupplement: "Are you sure you want to remove this supplement from your stack?",
    clonedStackSuccess: "Successfully cloned supplements to your stack!",
    clonedStackPartial: "Some supplements were cloned successfully, but some failed.",
    clonedStackFailed: "Failed to clone stack",
    errorCloningStack: "Error cloning stack",
    notFoundInDatabase: "Not found in database",
    statusFilterTitle: "Research Status",
    statusFilterSubtitle: "These colors indicate the level of scientific evidence:",
    statusFilterInfo: "Click for info",
    greenStatusDescription: "Well-researched and proven effective",
    blueStatusDescription: "Emerging research, promising but needs more studies",
    redStatusDescription: "Limited research or mixed results",
    
    // No dosing info
    noDosingInfo: "No specific dosing information available for this supplement. Please consult with a healthcare provider or follow product instructions.",
    
    // Basic Health Stack
    includeBasicHealthStack: "Include Basic Health Stack",
    includeBasicHealthStackDescription: "Add essential supplements (Vitamin D, Omega-3, Magnesium, etc.) to support overall health alongside your goals",
    basicHealthStack: "Basic Health Stack",
    basicHealthStackDescription: "Essential supplements for everyone: Vitamin D, Omega-3, Magnesium, and more",
    whyBasicHealthStack: "This supplement is included as part of your Basic Health Stack.",
    
    // Predefined Stack Names
    hypertrophyStack: "Hypertrophy Stack",
    hypertrophyStackDescription: "Optimized for muscle growth: Creatine, EAA, Whey Protein, Beta-Alanine",
    strengthStack: "Strength Stack",
    strengthStackDescription: "Designed for maximum strength: Creatine, Beta-Alanine, Caffeine, Citrulline",
    enduranceStack: "Endurance Stack",
    enduranceStackDescription: "For endurance athletes: Beetroot, Beta-Alanine, CoQ10, Caffeine",
    recoveryStack: "Recovery Stack",
    recoveryStackDescription: "Support recovery: EAA, Magnesium, Curcumin, Omega-3",
    focusStack: "Focus Stack",
    focusStackDescription: "Enhance focus and productivity: Caffeine, L-Theanine, ALCAR, Bacopa",
    memoryStack: "Memory Stack",
    memoryStackDescription: "Support memory and learning: Bacopa, ALCAR, Lion's Mane, Omega-3",
    productivityStack: "Productivity Stack",
    productivityStackDescription: "Boost daily productivity: Caffeine, L-Theanine, Rhodiola, B-Complex",
    antiAgingStack: "Anti-Aging Stack",
    antiAgingStackDescription: "Longevity optimization: NMN, Resveratrol, Quercetin, Fisetin",
    healthspanStack: "Healthspan Stack",
    healthspanStackDescription: "Extend healthy years: CoQ10, Alpha Lipoic Acid, Omega-3, Vitamin D",
    sleepQualityStack: "Sleep Quality Stack",
    sleepQualityStackDescription: "Improve sleep quality: Magnesium, Melatonin, Glycine, Ashwagandha",
    deepSleepStack: "Deep Sleep Stack",
    deepSleepStackDescription: "For deeper, more restful sleep: 5-HTP, Magnesium, GABA, L-Theanine",
    sleepDurationStack: "Sleep Duration Stack",
    sleepDurationStackDescription: "Support longer, more restful sleep: Melatonin, Magnesium, Glycine, Valerian",
    fallingAsleepStack: "Falling Asleep Stack",
    fallingAsleepStackDescription: "Help fall asleep faster: Melatonin, Magnesium, L-Theanine, Chamomile",
    moodStack: "Mood Stack",
    moodStackDescription: "Support mood and emotional well-being: Ashwagandha, 5-HTP, Omega-3, Magnesium",
    energyStack: "Energy Stack",
    energyStackDescription: "Boost cellular energy and vitality: CoQ10, ALCAR, Alpha Lipoic Acid, B-Complex",
    longevityOptimizationStack: "Longevity Optimization Stack",
    longevityOptimizationStackDescription: "Comprehensive longevity protocol: NMN, Resveratrol, Quercetin, Fisetin, Omega-3",
  },
  sv: {
    // Dashboard
    appName: "WhatDose",
    dailyStreak: "Daglig Streak",
    myDailyCheckIn: "Min Dagliga Check-in",
    todaysTasks: "Dagens Uppgifter",
    myStack: "Min Stack.",
    searchDatabase: "Sök Databas.",
    logEffect: "Logga Effekt.",
    refill: "Påfyllning.",

    // Landing Page
    loginButton: "Logga in",
    usedByBiohackers: "Används av 10 000+ biohackers",
    heroTitle: "Sluta Gissa Med Din",
    heroTitleHighlight: "Biologi.",
    heroDescription: "Det första AI-drivna doserings-protokollet baserat på",
    heroDescriptionBold: "500+ kliniska studier.",
    heroDescriptionContinued: "Optimera din stack. Eliminera risker. Känn skillnaden på 7 dagar.",
    ctaButton: "Få Mitt Gratis Protokoll",
    ctaSubtext: "Inget kreditkort krävs • Tar 2 minuter",

    // Old Way vs New Way Section
    oldWayVsNewWayTitle: "De Flesta Gör Helt Fel",
    oldWayTitle: "Det Gamla Sättet",
    newWayTitle: "WhatDose-sättet",
    oldWayItem1: "Slumpmässiga piller från Instagram-annonser",
    oldWayItem2: "Dyrt urin (100-tals kr slösade)",
    oldWayItem3: "Okända interaktioner",
    oldWayItem4: "Gissa doser från Reddit",
    newWayItem1: "AI-analyserad från 500+ peer-reviewed studier",
    newWayItem2: "Personaliserad till din biologi & mål",
    newWayItem3: "Interaktionsvarningar i realtid",
    newWayItem4: "Exakta timing- & dosprotokoll",
    oldWayVsNewWayDescription:
      "De flesta tar supplement blint. De slösar 100-tals kronor i månaden på saker som inte funkar—eller värre, tar ut varandra. WhatDose fixar detta direkt.",

    // Interactive Feature Showcase
    interactiveFeatureShowcaseTitle: "Allt Du Behöver På Ett Ställe",
    interactiveFeatureShowcaseDescription: "Sluta jongla 10 flikar. Få svar på sekunder.",

    // Feature 1: Database
    feature1Title: "Databasen",
    feature1Description: "Sök 200+ supplement med instant bevisbetyg.",
    searchPlaceholder: "Sök supplement...",
    feature1Status: "Grön Status: Verifierad",
    feature1Supplement: "Kreatin Monohydrat",
    feature1Dose: "5g dagligen",

    // Feature 2: Interaction Shield
    feature2Title: "Interaktionssköld",
    feature2Description: "Realtidsvarningar för farliga kombinationer.",
    feature2Warning: "Timingkonflikt Upptäckt",
    feature2Rescheduling: "Omplanerar Zink till morgon...",

    // Feature 3: Gamification
    feature3Title: "Daglig Streak",
    feature3Description: "Spåra adherens. Bygg vanan. Se resultat.",
    feature3DayStreak: "Dagars Streak",
    feature3Consistency: "Konsekvens",
    feature3Progress: "Framsteg",

    // Social Proof
    socialProofTitle: "Riktiga Människor. Riktiga Resultat.",
    testimonial1Name: "Marcus J.",
    testimonial1Role: "Entreprenör",
    testimonial1Text: "Äntligen slutade slösa pengar på supplement som inte fungerar ihop. Min energi är genom taket.",
    testimonial2Name: "Emma S.",
    testimonial2Role: "Fitnescoach",
    testimonial2Text:
      "Interaktionskollen ensam räddade mig från en dålig kombination. Den här appen är en game-changer.",
    testimonial3Name: "Johan K.",
    testimonial3Role: "Mjukvaruutvecklare",
    testimonial3Text: "Jag har testat varenda supplement-app. WhatDose är den enda som backas av riktig vetenskap.",

    // Final CTA
    finalCTATitle: "Redo Att Optimera Din Biologi?",
    finalCTADescription: "Gå med 10 000+ biohackers som slutade gissa och började optimera.",
    finalCTAButton: "Starta Din Gratis Analys",
    finalCTASubtext: "100% Gratis • Inget Kort Krävs • Omedelbar Åtkomst",

    // Onboarding
    step: "Steg",
    of: "av",
    goalsTitle: "Vad är dina mål?",
    goalsDescription: "Välj ett eller flera områden du vill optimera.",
    fitnessPerformance: "Fitness & Prestation",
    fitnessPerformanceSubcategory: "Välj ditt fokus:",
    fitnessPerformanceStrength: "Styrka & Kraft",
    fitnessPerformanceHypertrophy: "Muskeltillväxt",
    fitnessPerformanceEndurance: "Uthållighet & Cardio",
    fitnessPerformanceRecovery: "Återhämtning",
    cognitiveFocus: "Kognitiv Fokus",
    cognitiveSubcategory: "Välj ditt fokus:",
    cognitiveFocusMemory: "Minne & Inlärning",
    cognitiveFocusFocus: "Fokus & Koncentration",
    cognitiveFocusMood: "Humör & Välbefinnande",
    cognitiveFocusProductivity: "Produktivitet",
    longevity: "Longevity",
    longevitySubcategory: "Välj ditt fokus:",
    longevityAntiAging: "Anti-Aging",
    longevityHealthspan: "Hälsospann",
    longevityEnergy: "Cellulär Energi",
    longevityLongevity: "Longevity Optimering",
    sleep: "Sömn",
    sleepSubcategory: "Välj ditt fokus:",
    sleepQuality: "Sömnkvalitet",
    sleepDuration: "Sömnlängd",
    sleepDeepSleep: "Djupsömn",
    sleepFallingAsleep: "Somna",

    biometricsTitle: "Din Biometri",
    biometricsDescription: "Används för att beräkna personliga doser.",
    age: "Ålder",
    weight: "Vikt",
    gender: "Kön",
    male: "Man",
    female: "Kvinna",
    other: "Annat",

    experienceTitle: "Erfarenhetsnivå",
    experienceDescription: "Hur bekant är du med supplementering?",
    beginner: "Nybörjare",
    intermediate: "Medel",
    advanced: "Avancerad",
    biohacker: "Biohacker",

    experienceDescriptions: [
      "Vi börjar med grundläggande supplement och enkla rutiner.",
      "Du får tillgång till fler supplement och mer detaljerad info.",
      "Avancerade stacks och timing-optimering inkluderas.",
      "Full tillgång till alla funktioner och experimentella protokoll.",
    ],

    back: "Tillbaka",
    continue: "Fortsätt",
    startAnalysis: "Starta Analys",
    analyzing: "Analyserar...",
    creatingPlan: "Skapar din personliga supplementplan",
    calculatingDoses: "Beräknar optimala doser",
    
    // Create New Stack
    createNewStack: "Skapa Ny Stack",
    createNewStackDescription: "Skapa en ny stack baserad på dina uppdaterade mål",
    createNewStackButton: "Skapa Ny Stack",
    newStackCreated: "Ny stack skapad framgångsrikt!",
    replacingCurrentStack: "Detta kommer att ersätta din nuvarande stack. Fortsätt?",
    confirmReplace: "Ja, Ersätt Stack",
    cancel: "Avbryt",
    quickStackBuilder: "Snabb Stack Builder",
    quickStackDescription: "Välj dina mål så skapar vi en personlig stack åt dig",
    skipOnboarding: "Hoppa Över Full Setup",
    useFullOnboarding: "Använd Full Onboarding",

    // Daily Check-in
    checkInTitle: "Daglig Check-in",
    sleepQuality: "Sömnkvalitet",
    energyLevel: "Energinivå",
    sideEffects: "Biverkningar",
    adherence: "Följsamhet",

    poorSleep: "Dålig",
    okSleep: "OK",
    goodSleep: "Bra",
    excellentSleep: "Utmärkt",

    low: "Låg",
    medium: "Medel",
    high: "Hög",
    veryHigh: "Mycket Hög",

    none: "Inga",
    nausea: "Illamående",
    headache: "Huvudvärk",
    jitters: "Nervositet",
    digestive: "Matsmältning",
    insomnia: "Sömnlöshet",

    checkInComplete: "Check-in Klar!",
    checkInThankYou: "Tack för att du slutförde din dagliga check-in.",

    // Task List
    taskCompleted: "Uppgift slutförd",
    taskPending: "Väntande uppgift",

    // Daily Check-in (chat)
    dailyAnalysis: "Daglig Analys",
    goodMorning: "God morgon",
    howWasSleep: "Hur var sömnkvaliteten inatt?",
    howIsEnergy: "Hur känns energinivån i kroppen just nu?",
    anySideEffects: "Några noterbara bieffekter från din stack?",
    seeMissing: "Jag ser att du har kvar",
    inYourList: "i din lista. Har du tagit den?",

    yesTookIt: "Ja, tog nyss",
    noSkipping: "Nej, hoppar över",
    remindLater: "Påminn senare",

    confirm: "Bekräfta",
    continueBtn: "Fortsätt",
    close: "Stäng",

    checkInCompleteTitle: "Check-in Klar",

    lowSluggish: "Låg/Seg",
    stable: "Stabil",
    highPumped: "Hög/Pumpad",
    jitteryStressed: "Jittrig/Stressad",

    noneOption: "Inga",
    stomachIssues: "Magbesvär",
    headacheOption: "Huvudvärk",
    nauseaOption: "Illamående",
    heartPalpitations: "Hjärtklappning",

    goodSleepSummary: "bra sömn",
    okaySleepSummary: "okej sömn",
    poorSleepSummary: "dålig sömn",
    noSideEffectsSummary: "inga bieffekter",
    someSideEffectsSummary: "lite",

    summaryPrefix: "Noterat.",
    summarySuffix: "energi och",
    summaryEnd: "Vi håller koll på din progress!",

    // Library
    libraryTitle: "Bibliotek",
    searchSupplementsPlaceholder: "Sök efter substans (t.ex. Kreatin)...",
    all: "Alla",
    muscles: "Muskler",
    cognitive: "Kognitiv",
    stress: "Stress",
    proven: "Bevisad",
    emerging: "Emerging",
    description: "Beskrivning",
    recommendedDose: "Rekommenderad dos",
    interactions: "Interaktioner",
    addToStack: "Lägg till i Min Stack",
    greenStatus: "Bevisad",

    // Supplement names
    creatineMonohydrate: "Kreatin Monohydrat",
    omega3FishOil: "Omega-3 Fiskolja",
    magnesiumGlycinate: "Magnesium Glycinat",
    ashwagandha: "Ashwagandha",

    // Supplement descriptions
    creatineDesc: "Ett av de mest studerade supplementen. Ökar muskelmassa, styrka och kognitiv funktion.",
    omega3Desc: "Essentiella fettsyror för hjärthälsa, hjärnfunktion och inflammation.",
    magnesiumDesc: "Viktig mineral för sömn, muskelavslappning och nervfunktion.",
    ashwagandhaDesc: "Adaptogen som kan minska stress och förbättra sömnkvalitet.",

    // Dosing notes
    creatineDosing: "Laddningsfas ej nödvändig. Konstant 5g dagligen räcker.",
    omega3Dosing: "Ta med måltid innehållande fett för bättre upptag.",
    magnesiumDosing: "Ta på kvällen för bästa sömneffekt. Glycinat är skonsam för magen.",
    ashwagandhaDosing: "Effekt märks efter 4-8 veckors konsekvent användning.",

    // Interactions
    creatineInteraction1: "Koffein kan minska effekten temporärt",
    creatineInteraction2: "Säkert att kombinera med de flesta supplement",
    omega3Interaction1: "Kan förstärka blodförtunnande mediciner",
    omega3Interaction2: "Hög dos vitamin E bör undvikas",
    magnesiumInteraction1: "Undvik att ta samtidigt med kalcium",
    magnesiumInteraction2: "Kan interagera med vissa antibiotika",
    ashwagandhaInteraction1: "Kan förstärka lugnande mediciner",
    ashwagandhaInteraction2: "Undvik vid sköldkörtelproblem utan läkarkonsultation",

    // Community
    communityTitle: "Community",
    discoverStacks: "Upptäck stacks som funkar",
    result: "Resultat",
    cloneStack: "Klona Stack",

    // Community data
    deepSleepStack: "Deep Sleep Stack",
    increasedDeepSleep: "Ökade djupsömn med 20%",
    focusProtocol: "Focus Protocol",
    deepWorkDaily: "4+ timmar deep work dagligen",
    recoveryMax: "Recovery Max",
    reducedDOMS: "Minskad DOMS med 50%",

    // Profile
    profileTitle: "Profil",
    editProfile: "Redigera Profil",
    profileUpdated: "Profil uppdaterad framgångsrikt!",
    saving: "Sparar...",
    errorUpdatingProfile: "Kunde inte uppdatera profil",
    namePlaceholder: "Ange ditt namn",
    username: "Användarnamn",
    usernamePlaceholder: "Välj ett användarnamn",
    usernameDescription: "Detta kommer att visas i community",
    emailCannotBeChanged: "E-post kan inte ändras",
    notifications: "Notifikationer",
    appearance: "Utseende",
    privacy: "Integritet",
    helpSupport: "Hjälp & Support",
    logout: "Logga ut",
    dnaProfile: "DNA Profil",
    notConnected: "Inte ansluten",
    connect: "Anslut",
    daysStreak: "Dagar Streak",
    supplements: "Supplement",
    compliance: "Följsamhet",

    // Bottom Navigation
    home: "Hem",
    library: "Bibliotek",
    community: "Community",
    profile: "Profil",
    
    // My Stack
    addSupplement: "Lägg till Supplement",
    emptyStack: "Din stack är tom",
    emptyStackDescription: "Lägg till supplement från biblioteket för att komma igång",
    browseLibrary: "Bläddra i Bibliotek",
    syncToTasks: "Synka till Uppgifter",
    syncingTimeline: "Synkar...",
    timelineSynced: "Timeline synkad framgångsrikt! Uppdatera sidan för att se dina uppgifter.",
    
    // Stack Review
    hereIsYourStack: "Här är din Stack",
    stackReviewDescription: "Låt oss gå igenom varje tillskott och varför det valdes för dig",
    whySelected: "Varför Vald",
    benefits: "Fördelar",
    dosageOptions: "Dosalternativ",
    dosageOptionsDescription: "Detta är den vanliga rekommenderade dosen, men vissa tar denna dos. Vill du testa det?",
    standardDose: "Standarddos",
    standardDoseDescription: "Den vanligaste rekommenderade dosen",
    weightBasedDose: "Viktbaserad Dos",
    weightBasedDoseDescription: "Personifierad dos baserad på din vikt ({weight}kg)",
    lowDose: "Låg Dos",
    lowDoseDescription: "En lägre dos för känslighet eller att börja med",
    highDose: "Hög Dos",
    highDoseDescription: "En högre dos för förbättrade effekter",
    maxDose: "Maximal Dos",
    maxDoseDescription: "Den maximala rekommenderade dosen",
    cognitiveDose: "Kognitiv Dos",
    cognitiveDoseCreatineDescription: "Högre dos (upp till 20g/dag) som kan ge ytterligare kognitiva fördelar inklusive förbättrat minne, mental klarhet och hjärnenergi",
    previous: "Föregående",
    next: "Nästa",
    finish: "Klart",
    
    // Supplement-specific explanations
    whyCreatine: "Kreatin är ett av de mest forskade tillskotten för muskelväxt och styrka. Det är särskilt effektivt för hypertrofi-träning.",
    benefitCreatine1: "Ökar muskelstyrka och kraftproduktion",
    benefitCreatine2: "Förbättrar muskelväxt och återhämtning",
    benefitCreatine3: "Stödjer ATP-produktion för bättre träning",
    
    whyEAA: "Essential Amino Acids (EAA) är avgörande för muskelproteinsyntes. De är mer kompletta än BCAA och bättre för muskelväxt.",
    benefitEAA1: "Stimulerar muskelproteinsyntes (mTOR-aktivering)",
    benefitEAA2: "Stödjer muskelåterhämtning och växt",
    benefitEAA3: "Komplett aminosyraprofil för optimala resultat",
    
    whyCaffeine: "Koffein placeras i Pre-Workout för att maximera prestationen under träning. 200-300mg är det optimala intervallet för de flesta.",
    benefitCaffeine1: "Ökar energi och alerthet",
    benefitCaffeine2: "Förbättrar fysisk prestation och uthållighet",
    benefitCaffeine3: "Förbättrar fokus och mental klarhet",
    
    whyBCAA: "Branched Chain Amino Acids stödjer muskelåterhämtning och minskar trötthet under träning.",
    benefitBCAA1: "Minskar muskeltrötthet under träning",
    benefitBCAA2: "Stödjer muskelåterhämtning",
    
    whyALCAR: "Acetyl-L-Carnitine stödjer kognitiv funktion och energimetabolism.",
    benefitALCAR1: "Förbättrar kognitiv funktion och fokus",
    benefitALCAR2: "Stödjer energimetabolism",
    
    whyBacopa: "Bacopa Monnieri är ett välforskat nootropikum som stödjer minne och kognitiv funktion.",
    benefitBacopa1: "Förbättrar minne och inlärning",
    benefitBacopa2: "Minskar ångest och stress",
    
    whyDefault: "Detta tillskott valdes baserat på dina mål och underkategorier för att stödja dina mål.",
    benefitDefault1: "Stödjer dina valda mål",
    benefitDefault2: "Baserat på vetenskaplig forskning",
    benefitDefault3: "Väl tolererat och säkert för de flesta",
    
    // Generic personalized explanations
    whySelectedForGoals: "{name} valdes eftersom du valde {goals} som dina mål. Detta tillskott är särskilt fördelaktigt för dessa mål.",
    whySelectedForCategories: "{name} valdes eftersom det stödjer {categories}, vilket stämmer överens med dina mål.",
    whyDefaultGeneric: "{name} valdes baserat på dina mål och underkategorier för att stödja dina mål.",
    yourGoals: "dina mål",
    
    // Category-based generic benefits (for supplements without specific benefits)
    benefitHealth1: "Stödjer allmän hälsa och välmående",
    benefitMuscle1: "Främjar muskelväxt och återhämtning",
    benefitPerformance1: "Förbättrar fysisk prestation och uthållighet",
    benefitFocus1: "Förbättrar kognitiv funktion och mental klarhet",
    benefitStress1: "Hjälper till att hantera stress och stödjer humör",
    benefitMetabolic1: "Stödjer hälsosam metabolism och energiproduktion",
    benefitSleep1: "Främjar vila och återhämtning",
    benefitAntiAging1: "Stödjer cellulär hälsa och livslängd",
    benefitJoints1: "Stödjer ledhälsa och rörlighet",
    
    // Goal-specific explanations
    whyCreatineForFitness: "Kreatin valdes för dina {goals} mål. Det är ett av de mest forskade tillskotten för muskelväxt och styrka, särskilt effektivt för hypertrofi-träning.",
    whyEAAForFitness: "EAA (Essential Amino Acids) valdes för dina {goals} mål. De är avgörande för muskelproteinsyntes och mer kompletta än BCAA för muskelväxt.",
    whyCaffeineForGoals: "Koffein valdes för dina {goals} mål. Det placeras i Pre-Workout för att maximera prestationen under träning, med 200-300mg som det optimala intervallet.",
    whyBCAAForFitness: "BCAA valdes för dina {goals} mål. De stödjer muskelåterhämtning och minskar trötthet under träning.",
    whyALCARForCognitive: "ALCAR (Acetyl-L-Carnitine) valdes för dina {goals} mål. Det stödjer kognitiv funktion, fokus och energimetabolism.",
    whyBacopaForCognitive: "Bacopa Monnieri valdes för dina {goals} mål. Det är ett välforskat nootropikum som stödjer minne, inlärning och minskar ångest.",
    whyDHF: "7,8-Dihydroxyflavone (7,8-DHF) är en flavonoid som fungerar som en TrkB-agonist och stödjer brain-derived neurotrophic factor (BDNF) signalering.",
    whyDHFForCognitive: "7,8-Dihydroxyflavone valdes för dina {goals} mål. Det stödjer kognitiv funktion, minne och neuroplasticitet genom BDNF-aktivering.",
    benefitDHF1: "Förbättrar BDNF-signalering för neuroplasticitet",
    benefitDHF2: "Stödjer minnesbildning och inlärning",
    benefitDHF3: "Kan förbättra kognitiv prestation",
    
    // Generic personalized explanations
    whySelectedForGoals: "{name} valdes eftersom du valde {goals} som dina mål. Detta tillskott är specifikt fördelaktigt för dessa mål.",
    whySelectedForCategories: "{name} valdes eftersom det stödjer {categories}, vilket stämmer överens med dina mål.",
    whyDefaultGeneric: "{name} valdes baserat på dina mål och underkategorier för att stödja dina mål.",
    yourGoals: "dina mål",
    
    // Category names
    categoryHealth: "Hälsa",
    categoryMuscle: "Muskel",
    categoryPerformance: "Prestation",
    categoryFocus: "Fokus",
    categoryStress: "Stress",
    categoryMetabolic: "Metabolism",
    categorySleep: "Sömn",
    categoryAntiAging: "Anti-åldrande",
    categoryJoints: "Ledhälsa",
    
    // Library filters
    filterByCategory: "Filtrera på Kategori",
    filterByStatus: "Filtrera på Status",
    selectCategoryOrSearch: "Välj en kategori ovan eller skriv minst 2 tecken för att söka...",
    noSupplementsFound: "Inga tillskott hittades",
    
    // Share Stack
    shareYourStack: "Dela Din Stack",
    stackTitle: "Stack Titel",
    stackTitlePlaceholder: "t.ex., Min Hypertrofi Stack",
    stackDescriptionPlaceholder: "Beskriv din stack och varför du använder den...",
    stackResultsPlaceholder: "Vilka resultat har du uppnått med denna stack?",
    stackPreview: "Din stack innehåller:",
    moreSupplements: "fler tillskott",
    share: "Dela",
    sharing: "Delar...",
    stackSharedSuccessfully: "Din stack har delats framgångsrikt!",
    errorSharingStack: "Kunde inte dela stack",
    emptyStackCannotShare: "Din stack är tom. Lägg till tillskott i din stack först.",
    shareTitleRequired: "Vänligen ange en titel för din stack",
    optional: "Valfritt",
    pleaseSignIn: "Vänligen logga in för att dela din stack",
    confirmDeleteSupplement: "Är du säker på att du vill ta bort detta tillskott från din stack?",
    clonedStackSuccess: "Tillskott klonade framgångsrikt till din stack!",
    clonedStackPartial: "Några tillskott klonades framgångsrikt, men några misslyckades.",
    clonedStackFailed: "Kunde inte klona stack",
    errorCloningStack: "Fel vid kloning av stack",
    notFoundInDatabase: "Hittades inte i databasen",
    statusFilterTitle: "Forskningsstatus",
    statusFilterSubtitle: "Dessa färger indikerar nivån av vetenskapligt bevis:",
    statusFilterInfo: "Klicka för info",
    greenStatusDescription: "Välforskad och bevisat effektiv",
    blueStatusDescription: "Ny forskning, lovande men behöver fler studier",
    redStatusDescription: "Begränsad forskning eller blandade resultat",
    
    // No dosing info
    noDosingInfo: "Ingen specifik doseringsinformation tillgänglig för detta tillskott. Vänligen konsultera en vårdgivare eller följ produktens instruktioner.",
    
    // Basic Health Stack
    includeBasicHealthStack: "Inkludera Basic Health Stack",
    includeBasicHealthStackDescription: "Lägg till grundläggande tillskott (Vitamin D, Omega-3, Magnesium, etc.) för att stödja allmän hälsa utöver dina mål",
    basicHealthStack: "Basic Health Stack",
    basicHealthStackDescription: "Grundläggande tillskott för alla: Vitamin D, Omega-3, Magnesium och mer",
    whyBasicHealthStack: "Detta tillskott ingår som del av din Basic Health Stack.",
    
    // Predefined Stack Names
    hypertrophyStack: "Hypertrofi Stack",
    hypertrophyStackDescription: "Optimerad för muskelväxt: Kreatin, EAA, Whey Protein, Beta-Alanine",
    strengthStack: "Styrka Stack",
    strengthStackDescription: "Designad för maximal styrka: Kreatin, Beta-Alanine, Koffein, Citrulline",
    enduranceStack: "Uthållighet Stack",
    enduranceStackDescription: "För uthållighetsidrottare: Rödbeta, Beta-Alanine, CoQ10, Koffein",
    recoveryStack: "Återhämtning Stack",
    recoveryStackDescription: "Stöd återhämtning: EAA, Magnesium, Curcumin, Omega-3",
    focusStack: "Fokus Stack",
    focusStackDescription: "Förbättra fokus och produktivitet: Koffein, L-Theanine, ALCAR, Bacopa",
    memoryStack: "Minne Stack",
    memoryStackDescription: "Stöd minne och inlärning: Bacopa, ALCAR, Lion's Mane, Omega-3",
    productivityStack: "Produktivitet Stack",
    productivityStackDescription: "Öka daglig produktivitet: Koffein, L-Theanine, Rhodiola, B-Complex",
    antiAgingStack: "Anti-åldrande Stack",
    antiAgingStackDescription: "Longevity-optimering: NMN, Resveratrol, Quercetin, Fisetin",
    healthspanStack: "Hälsospann Stack",
    healthspanStackDescription: "Förläng friska år: CoQ10, Alpha Lipoic Acid, Omega-3, Vitamin D",
    sleepQualityStack: "Sömnkvalitet Stack",
    sleepQualityStackDescription: "Förbättra sömnkvalitet: Magnesium, Melatonin, Glycine, Ashwagandha",
    deepSleepStack: "Djup sömn Stack",
    deepSleepStackDescription: "För djupare, mer återhämtande sömn: 5-HTP, Magnesium, GABA, L-Theanine",
    sleepDurationStack: "Sömnlängd Stack",
    sleepDurationStackDescription: "Stöd längre, mer återhämtande sömn: Melatonin, Magnesium, Glycine, Valeriana",
    fallingAsleepStack: "Somna Snabbare Stack",
    fallingAsleepStackDescription: "Hjälp att somna snabbare: Melatonin, Magnesium, L-Theanine, Kamomill",
    moodStack: "Humör Stack",
    moodStackDescription: "Stöd humör och känslomässigt välbefinnande: Ashwagandha, 5-HTP, Omega-3, Magnesium",
    energyStack: "Energi Stack",
    energyStackDescription: "Öka cellulär energi och vitalitet: CoQ10, ALCAR, Alpha Lipoic Acid, B-Complex",
    longevityOptimizationStack: "Longevity Optimering Stack",
    longevityOptimizationStackDescription: "Omfattande longevity-protokoll: NMN, Resveratrol, Quercetin, Fisetin, Omega-3",
  },
}

export function useTranslation(lang: Language = "en") {
  const t = (key: keyof typeof translations.en): string => {
    const value = translations[lang][key] || translations.en[key]
    if (Array.isArray(value)) {
      return value as unknown as string
    }
    return value
  }

  const tArray = (key: keyof typeof translations.en): string[] => {
    const value = translations[lang][key] || translations.en[key]
    if (Array.isArray(value)) {
      return value
    }
    return [value]
  }

  return { t, tArray, lang }
}
