#!/usr/bin/env python3
"""
Translate Swedish supplement CSV to English using OpenAI API.
Reads API key from .env.local, .env file, or command-line argument.
Usage: python3 translate_with_openai.py [--api-key YOUR_KEY]
"""

import csv
import os
import sys
import time
import argparse
from dotenv import load_dotenv
from openai import OpenAI

# Parse command-line arguments
parser = argparse.ArgumentParser(description='Translate Swedish supplement CSV to English using OpenAI API')
parser.add_argument('--api-key', type=str, help='OpenAI API key (optional if set in .env file)')
args = parser.parse_args()

# Load environment variables from .env.local or .env
load_dotenv('.env.local')
load_dotenv('.env')

# Initialize OpenAI client - check multiple possible variable names
api_key = (
    args.api_key or  # Command-line argument
    os.getenv('OPENAI_API_KEY') or 
    os.getenv('OPENAI_KEY') or 
    os.getenv('OAI_API_KEY')
)

if not api_key:
    print("Error: OpenAI API key not found!")
    print("\nPlease provide the API key in one of these ways:")
    print("1. Command-line argument:")
    print("   python3 translate_with_openai.py --api-key your_api_key_here")
    print("\n2. Environment variable:")
    print("   export OPENAI_API_KEY=your_api_key_here")
    print("   python3 translate_with_openai.py")
    print("\n3. Add to .env.local or .env file:")
    print("   OPENAI_API_KEY=your_api_key_here")
    sys.exit(1)

client = OpenAI(api_key=api_key)

# Simple mappings for status and risk
STATUS_MAP = {'Grön': 'Green', 'Blå': 'Blue', 'Röd': 'Red'}
RISK_MAP = {'Låg': 'Low', 'Medium': 'Medium', 'Hög': 'High'}

def has_swedish_text(text):
    """Check if text contains Swedish words or characters."""
    if not text or text == '-' or text.strip() == '':
        return False
    
    text_lower = text.lower()
    
    # Check for Swedish characters (å, ä, ö)
    swedish_chars = ['å', 'ä', 'ö', 'Å', 'Ä', 'Ö']
    if any(char in text for char in swedish_chars):
        return True
    
    # Comprehensive list of common Swedish words
    swedish_indicators = [
        # Common words
        'är', 'och', 'för', 'med', 'på', 'av', 'till', 'det', 'som', 'kan',
        'inte', 'eller', 'vid', 'bättre', 'högre', 'lägre', 'från', 'till',
        'den', 'en', 'ett', 'de', 'om', 'i', 'att', 'har', 'var', 'så',
        # Medical/supplement terms (additional)
        'allergi', 'synaptisk', 'plasticitet', 'senolytisk', 'ionofor',
        # Medical/supplement terms
        'prekursor', 'mimetikum', 'neuroplasticitet', 'infektionsskydd',
        'fettlöslig', 'mitokondriell', 'energi', 'mitokondrier', 'vakenhet',
        'belastar', 'levern', 'leverenzym', 'immunstöd', 'hämmar', 'kväveoxidsyntas',
        'neuropati', 'humör', 'metabolit', 'magsyra', 'magsår', 'halsbränna',
        'matsmältning', 'lugnande', 'renad', 'laxerande', 'kolinkälla', 'kraft',
        'effektivt', 'luftvägsinfektion', 'kreativitet', 'ångest', 'fokus',
        'racetam', 'gaser', 'traditionell', 'användning', 'sömn', 'hämmare',
        'kamomill', 'persilja', 'inflammation', 'muskeltillväxt', 'anabol',
        'signal', 'kronisk', 'bättre', 'tveksam', 'biotillgänglighet', 'stress',
        'sömnbärande', 'cykla', 'veckor', 'mat', 'kvällen', 'påverka',
        'sköldkörtel', 'sederande', 'solskydd', 'lyster', 'karotenoid',
        'hud', 'ögon', 'naturlig', 'mikroalger', 'immunstärkande', 'långtids',
        'ökar', 'vita', 'blodkroppar', 'komplex', 'nerver', 'kofaktorer',
        'signalsubstanser', 'homocystein', 'metylering', 'hjärnatrofi', 'skydd',
        'inlärning', 'veckor', 'full', 'effekt', 'minne', 'fett', 'fettlösliga',
        'magbesvär', 'trötthet', 'blodsocker', 'insulin', 'mimic', 'korosolsyra',
        'hypoglykemi', 'minskad', 'muskelsparande', 'tillväxt', 'diabetisk',
        'neuropati', 'ages', 'upptag', 'tiamin', 'aktivering', 'dåligt',
        'tarmflora', 'interagerar', 'enzym', 'snällare', 'magen', 'buffrar',
        'mjölksyra', 'stickningar', 'ofarliga', 'kräver', 'laddning', 'veckor',
        'parestesi', 'metylgivare', 'kraftutveckling', 'stödjer', 'produktion',
        'endast', 'stomach', 'ulcers', 'wounds', 'bränner', 'behov', 'provitamin',
        'hudskydd', 'omvandlas', 'behov', 'säkrare', 'prostata', 'kolesterol',
        'växtsterol', 'vitalitet', 'immune', 'nutrient', 'dense', 'allergy',
        'mdr', 'stomach', 'psychobiotic', 'svartpeppar', 'upptag', 'substances',
        'glukuronidering', 'affects', 'medication', 'hår', 'naglar', 'interferes',
        'lab', 'tests', 'thyroid', 'heart', 'växt', 'hair', 'growth', 'b-vitamin',
        'test', 'interference', 'bitter', 'melon', 'charantin', 'plant', 'birch',
        'leaf', 'urinary', 'tract', 'detox', 'diuretic', 'blueberry', 'extract',
        'memory', 'antocyaniner', 'fenugreek', 'libido', 'testofen', 'extract',
        'after', 'meals', 'fiber', 'saponins', 'boron', 'citrate', 'glycinate',
        'free', 'testosterone', 'bones', 'lowers', 'shbg', 'bone', 'health',
        'hormones', 'joints', 'akba', 'lox', 'inhibitor', 'ledsmärta', 'choose',
        'content', 'broccoli', 'sprout', 'sulforaphane', 'hormone', 'balance',
        'potent', 'pineapple', 'protein', 'swelling', 'tom', 'stomach', 'injury',
        'stinging', 'nettle', 'allergy', 'binds', 'shbg', 'root', 'leaves',
        'immune', 'defense', 'antioxidant', 'liposomal', 'higher', 'uptake',
        'stays', 'longer', 'expensive', 'effective', 'cayenne', 'thermogenesis',
        'irritate', 'catuaba', 'bark', 'dopamine', 'brazilian', 'cbd', 'oil',
        'fullspektrum', 'smärta', 'endocannabinoid', 'system', 'price', 'celastrus',
        'paniculatus', 'intellect', 'tree', 'ayurvedic', 'nootropic', 'chaga',
        'mushroom', 'birch', 'chlorella', 'broken', 'cell', 'wall', 'chlorophyll',
        'måste', 'ha', 'chrysin', 'aromatase', 'inhibitor', 'theoretical', 'poor',
        'oral', 'uptake', 'cissus', 'quadrangularis', 'bone', 'healing', 'ketosterones',
        'citikolin', 'citicoline', 'acetylcholine', 'dopamin', 'focus', 'energy',
        'ökar', 'dopaminereceptorer', 'phospholipids', 'mycket', 'bra', 'bioavailablehet',
        'lemon', 'balm', 'melissa', 'officinalis', 'calming', 'gaba', 'transaminase',
        'inhibitor', 'cognition', 'anxiety', 'gaba-t', 'citrulline', 'malate',
        'pre-workout', 'pump', 'blood', 'flow', 'raising', 'conjugated', 'linoleic',
        'acid', 'fat', 'loss', 'moderate', 'effect', 'safflower', 'questionable',
        'humans', 'wrinkle', 'reduction', 'ubiquinone', 'ubiquinol', 'cordyceps',
        'sinensis', 'oxygen', 'uptake', 'atp', 'mycelium', 'most', 'common',
        'phytosome', 'piperine', 'required', 'regular', 'has', 'anti-inflammatory',
        'longvida', 'brain', 'cognition', 'crosses', 'bbb', 'free', 'meriva',
        'joint', 'clinically', 'studied', 'form', 'd-aspartic', 'acid', 'daa',
        'temporary', 'boost', 'lh', 'stimulation', 'diminishes', 'short', 'term',
        'pulse', 'd-chiro-inositol', 'pcos', 'ratio', 'myo', 'secondary', 'messenger',
        'd-mannose', 'urinary', 'tract', 'infection', 'e.', 'coli', 'binds', 'bacteria',
        'bladder', 'binder', 'd-serine', 'nmda-receptor', 'schizofreni-studier',
        'hormonell', 'effekt', 't-cellsaktivering', 'kritisk', 'säsongsdepression',
        'sad', 'serotoninsyntes', 'receptorer', 'insulinsekretion', 'betacell-funktion',
        'damiana', 'båda', 'könen', 'avslappnande', 'dgl', 'deglycyrrhizinated',
        'licorice', 'utan', 'glycyrrhizin', 'höjer', 'ej', 'blodtryck', 'dhea',
        'hormonprekursor', 'endast', 'konstaterad', 'brist', 'ålder', 'hormonella',
        'biverkningar', 'äldre', 't', 'östrogen', 'hormonell', 'obalans', 'dim',
        'diindolylmethane', 'östrogenmetabolism', 'från', 'kålväxter', 'ändra',
        'balance', 'bra', 'metaboliter', 'akne', 'pms', 'kål', 'devil', 'claw',
        'ryggvärk', 'artros', 'harpagosid', 'dong', 'quai', 'kvinnlig', 'hälsa',
        'ginseng', 'grape', 'seed', 'extract', 'blodtryck', 'cirkulation', 'rikt',
        'opc', 'proantocyanidiner', 'ödem', 'standardiserat', 'kollagenskydd', 'kärl',
        'dynamine', 'methylliberine', 'snabb', 'snabbare', 'koffein', 'teakrin',
        'vitamin', 'e', 'immunfunktion', 'äldre', 't-cellsfunktion', 'gamma-tocopherol',
        'antiinflammatorisk', 'form', 'kompletterar', 'alfa-tokoferol', 'eaa',
        'essential', 'amino', 'acids', 'stimulerar', 'proteinsyntes', 'mtor', 'kring',
        'träning', 'ecdysterone', 'spinach', 'cyanotis', 'muskelbyggande', 'anabol',
        'binder', 'er-beta', 'receptorn', 'echinacea', 'förkylning', 'fagocytos',
        'autoimmune', 'risk', 'electrolytes', 'na', 'k', 'mg', 'hydrering', 'svettning',
        'balans', 'viktig', 'enoki', 'dao', 'diamine', 'oxidase', 'histaminintolerans',
        'bryter', 'ner', 'histamin', 'digestive', 'enzymes', 'digestionsstöd', 'take',
        'varierar', 'stort', 'gluten', 'digesting', 'dpp-iv', 'vid', 'glutenkänslighet',
        'celiaki', 'prolin-rika', 'proteiner', 'lactase', 'enzyme', 'laktosintolerans',
        'intag', 'mjölk', 'epicatechin', 'myostatinhämmare', 'muskler', 'kakao', 'te',
        'exogenous', 'ketones', 'bhb', 'salts', 'omedelbar', 'ketos', 'hjärnenergi',
        'innehåller', 'mycket', 'salt', 'magbesvär', 'fasoracetam', 'adhd-forskning',
        'uppreglerar', 'fenugreek', 'bockhornsklöver', 'amning', 'blockera', 'dht',
        'dl-phenylalanine', 'dlpa', 'pain', 'endorfiner', 'blandning', 'd-', 'l-form',
        'pea', 'phenylethylamine', 'kärleksmolekylen', 'bryts', 'ner', 'snabbt', 'mao-b',
        'kortvarig', 'phenylpiracetam', 'fysisk', 'mental', 'kyla', 'stimulerande',
        'dopingklassad', 'tävling', 'tolerans', 'snabbt', 'fiber', 'glucomannan',
        'mättnad', 'gelbildande', 'fisetin', 'hög', 'dos', 'korta', 'intervall',
        'senolytiskt', 'take', 'fat', 'biotillgänglighet', 'fish', 'oil', 'omega-3',
        'ledstelhet', 'antiinflammatorisk', 'elderberry', 'sambucus', 'förkylning',
        'influensa', 'antiviral', 'effekt', 'fo-ti', 'he', 'shou', 'wu', 'grått',
        'hår', 'vitalitet', 'leverpåverkan', 'försiktig', 'levertoxicitet', 'folic',
        'acid', 'graviditet', 'celldelning', 'syntetisk', 'maskera', 'b12-brist',
        'methylfolate', 'foster', 'aktivt', 'folat', 'forskolin', 'coleus', 'forskohlii',
        'fettförbränning', 'camp', 'standardiserad', 'mage', 'lös', 'phosphatidic',
        'muskelstyrka', 'direkt', 'signal', 'phosphatidylserine', 'sänker', 'kortisol',
        'stödjer', 'soja', 'solroslecitin', 'ursprung', 'driven', 'kvällen', 'membranfluiditet',
        'fucoxanthin', 'från', 'tång', 'tid', 'fennel', 'seed', 'kramp-dämpande',
        'gaba', 'poor', 'over', 'bbb', 'fysiologiskt', 'stickningar', 'kan', 'förekomma',
        'pharmagaba', 'fermenterad', 'gh', 'theoreticalt', 'galantamine', 'drömmar',
        'lucid', 'dreaming', 'alzheimer-medicin', 'även', 'tillskott', 'illamående',
        'garcinia', 'cambogia', 'hca', 'aptit', 'fettsyntes', 'debatterad', 'ginkgo',
        'biloba', 'cirkulation', 'hjärna', 'äldre', 'blodflöde', 'minne', 'egb-761',
        'sexuellt', 'mikrocirkulation', 'blödning', 'panax', 'ginseng', 'erektion',
        'kväveoxid-mediator', 'amerikansk', 'kylande', 'tcm', 'standardisera', 'ginsenosider',
        'höja', 'sibirisk', 'eleuthero', 'siberian', 'uthållighet', 'mildare', 'gla',
        'nattljusolja', 'evening', 'primrose', 'skinproblem', 'eksem', 'omega-6',
        'glukomannan', 'konjac', 'mättnadskänsla', 'expanderar', 'drick', 'vatten',
        'kvävningsrisk', 'glukosamin', 'sulfate', 'sulfat', 'hcl', 'broskhälsa',
        'evidens', 'skaldjursallergy', 'glutathione', 'reducerat', 'reduced', 'dåligt',
        'oralt', 'setria', 'bättre', 'skinuppljusning', 'liposomalt', 'master',
        'defenseets', 'bränsle', 'glycerol', 'glycerpump', 'hyperhydrering', 'binder',
        'vätska', 'muskeln', 'klumpar', 'sig', 'pulver', 'glycine', 'sleepkvalitet',
        'kollagenbyggsten', 'söt', 'smak', 'tas', 'sänggående', 'kroppstemp', 'goji',
        'berry', 'lycium', 'zeaxantin', 'gotu', 'kola', 'centella', 'asiatica',
        'cirkulation', 'kollagensyntes', 'nerver', 'neuroprotektiv', 'grains', 'paradise',
        'aframomum', 'aktiverar', 'brunt', 'batt', 'krydda', 'ingefärsfamiljen',
        'pomegranate', 'extract', 'ellagsyra', 'omvandlas', 'urolithin', 'grapefruit',
        'seed', 'extract', 'kontroversiell', 'konserveringsmedel', 'cyp3a4-hämmare',
        'gröna', 'kaffebönor', 'green', 'coffee', 'bean', 'klorogensyra', 'lågt',
        'vikt', 'glukosupptag', 'grönt', 'te', 'egcg', 'påverka', 'extrem', 'dos',
        'sällsynt', 'skydd', 'polyfenoler', 'guaraná', 'guarana', 'naturligt', 'långsamt',
        'frisläpps', 'långsammare', 'syntetiskt', 'gullris', 'goldenrod', 'njurar',
        'urinvägar', 'diuretic', 'gurkmeja', 'hel', 'turmeric', 'root', 'powder',
        'mild', 'svårupptagen', 'svartpeppar', 'gymnema', 'sylvestre', 'sockerblockerare',
        'regenerera', 'betaceller', 'sockerbegär', 'sugar', 'destroyer', 'blockerar',
        'smak', 'hawthorn', 'hjärtsvikt', 'kontraktilitet', 'digoxin-interaktion',
        'hallonblad', 'raspberry', 'leaf', 'livmoderhälsa', 'traditionell', 'gravidte',
        'hallonketoner', 'ketones', 'strukturellt', 'lik', 'synefrin', 'capsaicin',
        'hemp', 'protein', 'veganskt', 'fiberrikt', 'lägre', 'proteinhalt', 'havtornsolja',
        'sea', 'buckthorn', 'torra', 'slemhinnor', 'underliv', 'hesperidin', 'cirkulation',
        'vener', 'ofta', 'citrusbioflavonoider', 'hibiskus', 'hibiscus', 'tea', 'fungerar',
        'mild', 'ace-hämmare', 'koppar', 'higenamine', 'beta-2', 'agonist', 'luftvägar',
        'wada-förbjuden', 'hjärtklappning', 'hmb', 'beta-hydroxy', 'beta-methylbutyrate',
        'antikatabolt', 'diet', 'kalciumsalt', 'fri', 'syra', 'holy', 'basil', 'tulsi',
        'adaptogen', 'hordenin', 'mao-b', 'hämmare', 'förlänger', 'stimulanter', 'horny',
        'goat', 'weed', 'icariin', 'pde5-hämmare', 'svag', 'standardisera', 'hops',
        'extract', 'sedativ', 'valeriana', 'huperzine', 'a', 'acetylkolinesterashämmare',
        'cykla', 'undvika', 'kolinerga', 'biverkningar', 'ache-hämmare', 'hyaluronic',
        'acid', 'skin', 'fukt', 'binder', 'vatten', 'ledvätska', 'oral', 'fungerar',
        'fuktighet', 'molekylvikt', 'svårabsorberad', 'indole-3-carbinol', 'i3c',
        'prekursor', 'mindre', 'stabil', 'ginger', 'root', 'illamående', 'prokinetisk',
        'tömmer', 'liknar', 'nsaid', 'cox-hämmare', 'gingeroler', 'aktiva', 'ämnet',
        'blodförtunnande', 'inositol', 'panikanxiety', 'ocd', 'höga', 'doser', 'krävs',
        'insulinkänslighet', 'cellsignalering', 'ip6', 'hexaphosphate', 'cellhälsa',
        'kelaterar', 'mineraler', 'pulverform', 'enklast', 'lös', 'inulin', 'fos',
        'prebiotika', 'kan', 'ge', 'fodmap', 'iodine', 'sköldkörtel', 'hjärna',
        'kaliumjodid', 'kelp', 'autoimmune', 'tyreoidit', 'balans', 'johannesört',
        'st.', "john's", 'wort', 'mild', 'många', 'läkemedelsinteraktioner', 'p-piller',
        'antidepressiva', 'ssri-liknande', 'läkemedelsinteraktion', 'jordbaserad',
        'soil', 'based', 'organisms', 'sbo', 'tålig', 'sporform', 'bacillus-stammar',
        'subtilis', 'iron', 'menstruerande', 'kvinnor', 'ersätter', 'förlust', 'bisglycinat',
        'blodvärde', 'skonsam', 'endast', 'brist', 'oxidativ', 'stress', 'överskott',
        'heme', 'animaliskt', 'färre', 'magbiverkningar', 'överdosrisk', 'sulfat',
        'anemi', 'hård', 'toxiskt', 'barn', 'jättenattljusolja', 'pms', 'bröstömhet',
        'gamma-linolensyra', 'calcium', 'benskörhet', 'kombinera', 'd3', 'k2', 'kärlrisk',
        'citrate', 'oberoende', 'magsyra', 'risk', 'för', 'kärlförkalkning', 'karbonat',
        'take', 'kräver', 'syra', 'förstoppning', 'alfa-ketoglutarate', 'ca-akg',
        'förlänger', 'healthspan', 'sänker', 'biologisk', 'ålder', 'fördröjd', 'frisättning',
        'sustained', 'release', 'd-glucarate', 'toxiner', 'hämmar', 'beta-glukuronidas',
        'kan', 'öka', 'utsöndring', 'medicin', 'glukuronidering', 'potassium', 'muskelfunktion',
        'dos', 'tillskott', 'pga', 'säkerhetsrisk', 'hjärtrisk', 'njursvikt', 'via', 'kost',
        'njurproblem', 'chamomile', 'apigenin', 'cinnamon', 'ceylon', 'välj', 'lågt',
        'kumarin', 'caprylic', 'acid', 'candida', 'tarmhälsa', 'fettsyra', 'kokos',
        'carnitine', 'hjärthälsa', 'angina', 'energiproduktion', 'tmao', 'mitokondriell',
        'transport', 'casein', 'långsamt', 'natt', 'antikatabolt', 'mjölkallergy', 'catalase',
        'h2o2-nedbrytning', 'tveksamt', 'kava', 'kavalaktoner', 'leverrisk', 'missbruk',
        'alkohol', 'keratin', 'solubiliserat', 'solubilized', 'hairstruktur', 'cynatine',
        'hns', 'varumärke', 'kisel', 'bambu', 'bamboo', 'horsetail', 'nagel-styrka',
        'rikare', 'åkerfräken', 'orto-kisel', 'klorofyll', 'kroppslukt', 'gröna', 'växter',
        'alger', 'caffeine', 'anhydrous', 'prestationshöjande', 'snabb', 'absorption',
        'toleransutveckling', 'sleepstörning', 'adenosin-antagonist', 'theanin', 'jitters',
        'klassisk', 'stack', 'kolanöt', 'kola', 'nut', 'koffeinkälla', 'traditionell',
        'stimulant', 'choline', 'bitartrate', 'cellmembran', 'kan', 'öka', 'hydrolyserat',
        'hydrolyzed', 'peptides', 'tas', 'gärna', 'c-vitamin', 'types', 'bovint', 'marint',
        'uc-ii', 'autoimmune', 'oral', 'tolerans', 'liten', 'colostrum', 'antikroppar',
        'ig', 'råmjölk', 'mjölkprotein', 'chondroitin', 'synergi', 'synergistisk',
        'blodförtunnande', 'copper', 'pigment', 'balansera', 'alltid', 'toxiskt', 'i',
        'överskott', 'barley', 'grass', 'näring', 'antioxidanter', 'liknar', 'vetegräs',
        'glutenrisk', 'kre-alkalyn', 'buffered', 'ph-stabilt', 'bevisat', 'monohydrat',
        'kognitiv', 'fatigue', 'hcl', 'samma', 'effekt', 'mono', 'mindre', 'vattenretention',
        'theoreticalt', 'sur', 'smak', 'underhållsdos', 'dagligen', 'laddning', 'valfri',
        'bäst', 'kolhydrater', 'drick', 'extra', 'krom', 'chromium', 'sötsug', 'pikolinat',
        'picolinate', 'stabilt', 'upptagbart', 'kronärtskocka', 'artichoke', 'galla',
        'minskar', 'uppblåsthet', 'gallsten', 'cynarin', 'gallflöde', 'kurkumin', 'curcumin',
        'hjärninflammation', 'plack', 'l-arginine', 'kväveoxid', 'sämre', 'citrulline',
        'stor', 'del', 'bryts', 'ner', 'herpesutbrott', 'l-citrullin', 'no-boost',
        'l-cysteine', 'keratinbyggsten', 'svavelaminosyra', 'l-fenylalanin', 'l-phenylalanine',
        'noradrenalin-prekursor', 'aptitdämpning', 'ej', 'pku', 'l-glutamin', 'l-glutamine',
        'tarmslemhinna', 'primärt', 'bränsle', 'enterocyter', 'tarmvägg', 'muskelåterhämtning',
        'tarmceller', 'l-karnitin', 'l-tartrat', 'l-carnitine', 'androgenreceptorer',
        'muskelvävnad', 'l-lysine', 'l-lysine', 'herpes', 'munsår', 'antagonist',
        'l-metionin', 'l-methionine', 'essentiell', 'aminosyra', 'l-metylfolat',
        'l-methylfolate', '5-mthf', 'mthfr-mutation', 'aktiv', 'form', 'kräver', 'omvandling',
        'l-ornitin', 'l-ornithine', 'ammoniak-detox', 'synergi', 'l-thp', 'l-tetrahydropalmatine',
        'smärta', 'dopamine-antagonist', 'corydalis', 'sedering', 'l-tryptofan', 'l-tryptophan',
        'melatonin-prekursor', 'konkurrerar', 'bcaa', 'akut', 'kyla', 'sömnbrist', 'tom',
        'sköldkörtelinteraktion', 'lactobacillus', 'rhamnosus', 'gg', 'immun', 'allergy',
        'välstuderad', 'stam', 'lakritsrot', 'deglycyrrhizinerad', 'höjer', 'tryck',
        'laktoferrin', 'lactoferrin', 'järnbindande', 'lavendelolja', 'lavender', 'oral',
        'silexan', 'studerat', 'rapar', 'lavendel', 'laxogenin', '5-alpha-hydroxy-laxogenin',
        'växtanabol', 'kortisolkontroll', 'smilax', 'sieboldii', 'leucin', 'l-leucine',
        'mtor-trigger', 'viktigaste', 'anabolism', 'lingonextrakt', 'lingonberry', 'resveratrol',
        'procyanidiner', "lion's", 'mane', 'ngf', 'nervtillväxt', 'fruktkropp', 'varmvattens-',
        'alkoholextrakt', 'litiumorotat', 'lithium', 'orotate', 'humörsvängningar', 'mikrodos',
        'läkemedelsdos', 'lutein', 'skinelasticitet', 'blått', 'ljus-skydd', 'zeaxanthin',
        'ögonhälsa', 'gula', 'fläcken', 'carotenoider', 'skyddar', 'mot', 'luteolin',
        'neuroprotektion', 'hämmar', 'mikroglia-aktivering', 'lycopene', 'tomater', 'tomat',
        'tomatextrakt', 'motverkar', 'balansera', 'läkemalva', 'marshmallow', 'slemhinnor',
        'hosta', 'liknar', 'rödalmsbark', 'irriterad', 'tarm', 'hals', 'slemsubstans',
        'maca', 'spermieproduktion', 'gelatiniserad', 'gul', 'allmän', 'hälsa', 'standardtypen',
        'röd', 'boneshälsa', 'påverkar', 'direkt', 'svart', 'magnesium', 'spänning',
        'lugnar', 'nervsystemet', 'arytmi', 'relaxing', 'vessels', 'insulinresistens',
        'kofaktor', 'glykolys', 'l-threonate', 'refers', 'total', 'compound', 'approximately',
        'elemental', 'unique', 'ability', 'cross', 'blood-brain', 'barrier', 'glycinate',
        'preferably', 'gentle', 'relaxation', 'kombo', 'malate', 'fibromyalgia', 'taurate',
        'calming', 'taurine', 'increases', 'intracellular', 'magnoliabark', 'magnolia', 'bark',
        'honokiol', 'magnolol', 'aktivit', 'ämne', 'maitake', 'd-fraction', 'immunaktivering',
        'fraktion', 'manganese', 'sod', 'neurotoxiskt', 'mycket', 'höga', 'doser', 'manuka',
        'honey', 'mgo', 'lokal', 'sår', 'socker', 'maskrosblad', 'dandelion', 'vätskedrivande',
        'kaliumsparande', 'bladen', 'njurarna', 'maskrosrot', 'diuretika', 'mct-olja', 'mct',
        'oil', 'c8', 'c10', 'ketone', 'production', 'kaprylsyra', 'mest', 'potent', 'start',
        'discomfort', 'alzheimer-stöd', 'thermogenesis', 'ketoner', 'energiförbrukning',
        'caprylic', 'börja', 'lågt', 'magras', 'pulver', 'gentler', 'än', 'olja', 'melatonin',
        'insomning', 'dygnsrytm', 'ofta', 'effektivare', 'kan', 'ge', 'mardrömmar', 'hormon',
        'drömmar', 'mjölkdistel', 'milk', 'thistle', 'silymarin', 'leverhälsa', 'komplex',
        'hepatocyter', 'cyp-interaktioner', 'mjölon', 'uva', 'ursi', 'akut', 'arbutin',
        'bildar', 'hydrokinon', 'korttidsbruk', 'molybdenum', 'sulfiter', 'urinsyra',
        'essentiellt', 'spårämne', 'monolaurin', 'höljeförsedda', 'kokosolja', 'laurinsyra',
        'msm', 'methylsulfonylmethane', 'svaveldonator', 'ledhälsa', 'antioxidat', 'tas',
        'upp', 'väl', 'skönhetsmineral', 'mucuna', 'pruriens', 'l-dopa', 'motivations-boost',
        'nedreglering', 'muira', 'puama', 'potency', 'wood', 'munkpeppar', 'vitex', 'chasteberry',
        'progesteron', 'prolaktin', 'myo-inositol', 'släkting', 'n-acetyl', 'l-tyrosin',
        'nalt', 'mer', 'löslig', 'sämre', 'omvandling', 'tyr', 'water-soluble', 'n-metyltyramin',
        'n-methyltyramine', 'gastrin', 'n-acetyl', 'cysteine', 'slem', 'lungor', 'tvångssyndrom',
        'beroende', 'glutamat-modulering', 'n-acetylcystein', 'slemrösande', 'svaveldoft',
        'biotillgänglig', 'natriumbikarbonat', 'sodium', 'bicarbonate', 'mjölksyrabuffert',
        'kroppsvikt', 'magsmärtor', 'magkramp', 'diarré', 'nattokinase', 'blodcirkulation',
        'fibrinolytisk', 'niacin', 'nicotinic', 'acid', 'hdl', 'ldl-kvot', 'flush-varianten',
        'niacinamide', 'nicotinamide', 'ingen', 'akne', 'skinbarrier', 'rodnad', 'nmn',
        'nicotinamide', 'mononucleotide', 'morgonen', 'stöd', 'sublingualt', 'liposomalt',
        'föredras', 'påverkar', 'methylation', 'åldersrelaterad', 'noopept', 'bdnf', 'ngf',
        'mycket', 'potent', 'mg-dos', 'nässla', 'blad', 'nettle', 'histaminhämmande',
        'rot', 'bph', 'shbg-bindning', 'odenaturerat', 'undenatured', 'immunmodulering',
        'ledhälsa', 'verkar', 'tarmen', "peyer's", 'patches', 'oktopamin', 'octopamine',
        'norepinefrin', 'svagare', 'oleamid', 'oleamide', 'sleepinducering', 'ackumuleras',
        'sömnbrist', 'olivbladsextrakt', 'olive', 'leaf', 'extract', 'oleuropein', 'herxheimer-reaktion',
        'epa', 'dha', 'total', 'mängd', 'fatrik', 'måltid', 'skin', 'fukt', 'viktigast',
        'mood', 'oreganoolja', 'oregano', 'oil', 'starkt', 'irritera', 'slemhinnor', 'slår',
        'ut', 'goda', 'bakterier', 'stark', 'carvacrol', 'ornitin', 'ammoniak', 'ostronskivling',
        'oyster', 'mushroom', 'lovastatin', 'statin-liknande', 'ämnen', 'oxgalla', 'ox', 'bile',
        'fettsmältning', 'utan', 'gallblåsa', 'ersätter', 'galla', 'oxiracetam', 'logik',
        'stimulans', 'p-5-p', 'pyridoxal-5-phosphate', 'pyridoxal', 'kofaktor', 'neurotransmittorer',
        'leveromvandling', 'höga', 'neuropati', 'paba', 'b-vitaminkofaktor', 'dela', 'folsyra-molekylen',
        'sulfamedicin-interaktion', 'förr', 'tiden', 'folat', 'pantetin', 'pantethine', 'aktiv',
        'b5', 'kolesterol', 'pantotensyra', 'pantothenic', 'akne', 'fettmetabolism', 'papaya',
        'enzyme', 'papain', 'protein-nedbrytning', 'tuggtabletter', 'vanliga', 'passionsblomma',
        'passion', 'flower', 'dåsighet', 'pepparmynta', 'peppermint', 'ibs', 'kramp', 'tarm',
        'enterokapslar', 'bäst', 'refluxrisk', 'kapslad', 'halsbränna', 'phenylalanine',
        'pkU-varning', 'phgg', 'guar', 'gum', 'väl', 'tolererad', 'gasbildande', 'polygala',
        'tenuifolia', 'neuroplasticitet', 'unik', 'verkningsmekanism', 'poria', 'cocos',
        'njurhälsa', 'kinesisk', 'medicin', 'pqq', 'pyrroloquinoline', 'quinone', 'mitokondriell',
        'biogenes', 'synergi', 'q10', 'skinens', 'mitokondrier', 'nytt', 'inom', 'skinvård',
        'hjärna', 'hjärta', 'nybildning', 'pramiracetam', 'starkt', 'fettlöslig', 'emotionell',
        'avtrubbning', 'prebiotika', 'galaktooligosackarider', 'snällare', 'mat', 'bakterier',
        'pregnenolon', 'pregnenolone', 'master', 'hormone', 'neurosteroid', 'hormonpåverkan',
        'probiotika', 'allmän', 'multi-strain', 'tarm-immune-axel', 'defenseet', 'probiotic',
        'longum', 'stressstomach', 'acidophilus', 'allmän', 'maghälsa', 'laktos', 'vanligaste',
        'reuteri', 'dsm', '17938', 'kolik', 'd-vitaminupptag', 'stam-specifik', 'rhamnosus',
        'diarré', 'boulardii', 'saccharomyces', 'mot', 'antibiotika-diarré', 'jästsvamp',
        'dör', 'antibiotika', 'immunesupprimerade', 'prolin', 'l-proline', 'kollagenstruktur',
        'icke-essentiell', 'bee', 'propolis', 'bikupa-antibiotika', 'munhåla', 'psyllium',
        'husk', 'sänker', 'cholesterol', 'mättnad', 'måste', 'mycket', 'vatten', 'kan',
        'påverka', 'medicinupptag', 'pterostilben', 'pterostilbene', 'mer', 'potent', 'analog',
        'bättre', 'oral', 'pumpakärnolja', 'pumpkin', 'seed', 'oil', 'hairavfall', 'naturlig',
        'betasitosterol', 'pumpakärnor', 'blåsa', 'pycnogenol', 'pine', 'bark', 'patenterat',
        'skinelasticitet', 'pigmentering', 'tallbarksextrakt', 'pygeum', 'africanum', 'afrikanskt',
        'plommon', 'ofta', 'kombinerat', 'saw', 'palmetto', 'hjärtsvikt', 'statin-biverkning',
        'till', 'hjärtat', 'ubiquinol', 'reducerade', 'aktiva', 'interagerar', 'waran',
        'quercetin', 'zink-jonofor', 'senolytisk', 'fytosom', 'virusinträde', 'rauwolscine',
        'alpha-yohimbine', 'liknar', 'yohimbin', 'stereoisomer', 'stark', 'reishi', 'lugn',
        'mushroom', 'immortality', 'immunmodulerande', 'beta-glukaner', 'resistent', 'stärkelse',
        'resistant', 'starch', 'butyrat-produktion', 'tarmflora', 'potatismjöl', 'grön',
        'banan', 'resveratrol', 'anti-aging', 'sirtuin-aktivering', 'sirtuiner', 'hjärnblood',
        'metabol', 'hälsa', 'ampk', 'trans', 'kräver', 'fett', 'mikronisering', 'cyp450-interaktioner',
        'rhodiola', 'rosea', 'standardiserad', 'rosavins', 'morgonen', 'stimulerande', 'risprotein',
        'rice', 'kombinera', 'ärt', 'komplett', 'rutin', 'kärlhälsa', 'hemorrojder', 'glykosid',
        'rödalm', 'slippery', 'elm', 'slemsubstans', 'mucilage', 'tas', 'rödalmsbark',
        'tarmslemhinna', 'bildar', 'hindra', 'rödbetsjuice', 'beetroot', 'nitrat', 'vasodilatation',
        'konc', 'beet', 'root', 'juice', 'concentrate', 'prestation', 'nitratladdning', 'dosering',
        'ca', 'rödbetspulver', 'powder', 'nitrates', 'endurance', 'standardisera', 'nitratinnehåll',
        'sänker', 'rödklöver', 'red', 'clover', 'klimakteriet', 'fytoöstrogen', 'rödris',
        'red', 'yeast', 'rice', 'monacolin', 'q10-brist', 's.', 'boulardii', 'jäst-probiotika',
        'antibiotika-stomach', 'sabroxy', 'oroxylum', 'indicum', 'dopamineåterupptag', 'saffran',
        'saffron', 'affron', 'satiereal', 'aptitdämpning', 'påverkar', 'sam', 's-adenosyl',
        'methionine', 'metylgivare', 'mani', 'bipolär', 'sjukdom', 'sarcosin', 'sarcosine',
        'glycin-transportörhämmare', 'schizofreni', 'saw', 'palmetto', 'håravfall', 'hämmar',
        '5-alfa-reduktas', 'förstoring', 'standardiserad', 'fettsyra', 'schisandra', 'berry',
        'fas', 'detox-stöd', 'scullcap', 'skullcap', 'baikal', 'nervskydd', 'baicalin',
        'selenium', 'virusförsvar', 'brist', 'ökar', 'virus-virulens', 'selenometionin',
        'selenomethionine', 'organisk', 'lagras', 'vävnad', 'toxiskt', 'vid', 'överdos',
        'sellerifröextrakt', 'celery', 'seed', 'extract', '3nb', 'gikt', 'standardiserat',
        'ftalider', 'serrapeptase', 'ärrvävnad', 'scar', 'tissue', 'enzym', 'shiitake',
        'ahcc', 'ett', 'extract', 'från', 'denna', 'silverax', 'black', 'cohosh', 'vallningar',
        'ej', 'serotonin', 'leverrisk', 'smörsyra', 'butyrate', 'tarmhälsa', 'luktar',
        'illa', 'smör', 'cellenergi', 'sojaisoflavoner', 'soy', 'isoflavones', 'hormonkänslig',
        'cancer', 'sojaprotein', 'soy', 'protein', 'isoflavoner', 'spermidine', 'främjar',
        'autofagi', 'vetegroddsextrakt', 'wheat', 'germ', 'extract', 'cellförnyelse',
        'innehåller', 'gluten', 'vete', 'spirulina', 'tungmetall-detox', 'kontrollera',
        'renhet', 'toxiner', 'sulbutiamin', 'sulbutiamine', 'motivation', 'syntetisk',
        'b1-dimer', 'toleransutveckling', 'sulforafan', 'sulforaphane', 'nrf2-aktivering',
        'kräver', 'myrosinas', 'aktivering', 'svartkumminolja', 'black', 'seed', 'oil',
        'nigella', 'sativa', 'thymoquinone', 'svartvinbärsolja', 'black', 'currant',
        'gla-källa', 'synefrin', 'synephrine', 'bitter', 'orange', 'liknar', 'efedrin',
        'säkrare', 'p-synefrin', 'säkrast', 'sågpalmetto', 'manligt', 'kvinnligt',
        'blockerar', 'dht', 'tallbarksextrakt', 'tart', 'cherry', 'extract', 'urinsyra',
        'gikt', 'återhämtning', 'idrott', 'naturligt', 'också', 'antiinflammatorisk',
        'taurin', 'taurine', 'cellvolym', 'finns', 'energidryck', 'motverkar', 'skak',
        'osmoregulation', 'tauroursodeoxycholsyra', 'tudca', 'gallflöde', 'skyddar',
        'celldöd', 'er-stress', 'tautin', 'kramp', 'gaba-agonist', 'teakrin', 'theacrine',
        'teacrine', 'energi', 'utan', 'krasch', 'mindre', 'tolerans', 'teanin', 'theanine',
        'avslappning', 'alfavågor', 'teobromin', 'theobromine', 'kakao-extrakt', 'vidgar',
        'blodkärl', 'lång', 'halveringstid', 'giftigt', 'hundar', 'cocoa', 'flavanoler',
        'tokotrienoler', 'tocotrienols', 'e-vitaminform', 'antioxidantskydd', 'tokoferoler',
        'tongkat', 'ali', 'longjack', 'extrakt', 't.ex.', 'lowers', 'tranbär', 'cranberry',
        'pacs', 'standardized', 'hindrar', 'adhesion', 'dosering', 'avs', 'förhindrar',
        'e.coli-fäste', 'tranbärsextrakt', 'urinvägshälsa', 'tremella', 'snow', 'fungus',
        'fukt', 'skönhet', 'tribulus', 'terrestris', 'testo', 'lust', 'muskel', 'protodioscin',
        'tryptofan', 'säkrare', 'rate-limited', 'turkesterone', 'ajuga', 'ekdysteroid',
        'plant', 'sterol', 'androgen', 'turkey', 'tail', 'cancer-stöd', 'psk', 'psp',
        'polysackarider', 'immunstöd', 'cellgifter', 'tyrosin', 'tyrosine', 'krävs',
        'sköldkörtelhormon', 'drive', 'kognitiv', 'arbetsminne', 'under', 'press',
        'uridinmonofosfat', 'uridine', 'monophosphate', 'dopaminreceptorer', 'synapser',
        'dha', 'kolin', 'valeriana', 'valerian', 'oro', 'valerensyra', 'valerianarot',
        'valerian', 'root', 'gaba-aktivitet', 'dåsighet', 'vanadin', 'vanadium', 'vanadyl',
        'sulfate', 'spårelement', 'vassleprotein', 'whey', 'protein', 'snabbt', 'post-workout',
        'högt', 'leucin', 'anabolt', 'vetegroddsextrakt', 'vetegräs', 'wheatgrass', 'ph-balans',
        'enzymer', 'vitaminer', 'vinpocetin', 'vinpocetine', 'hjärnans', 'syntetisk', 'från',
        'periwinkle', 'vasodilator', 'vit', 'kidneyböna', 'white', 'kidney', 'bean', 'extract',
        'kolhydratblockerare', 'amylashämmare', 'före', 'stärkelserik', 'gas', 'uppblåsthet',
        'njur-böna', 'hämmar', 'alfa-amylas', 'gaser', 'vitamin', 'a', 'skincell-omsättning',
        'retinol', 'animaliskt', 'maxdos', 'vitamin', 'b1', 'tiamin', 'thiamine', 'kolhydratmetabolism',
        'vattenlöslig', 'vitamin', 'b12', 'adenosylcobalamin', 'adenosyl', 'mitokondriell',
        'krebs-cykeln', 'cyanokobalamin', 'cyanocobalamin', 'standardform', 'sämre', 'metyl',
        'adeno', 'metylkobalamin', 'methylcobalamin', 'nervhälsa', 'sublingualt', 'effektivt',
        'vitamin', 'b2', 'riboflavin', 'migrän', 'färgar', 'urin', 'neongul', 'vitamin',
        'b3', 'nicotinic', 'orsakar', 'skinrodnad', 'flush', 'leverpåverkan', 'extrem',
        'vitamin', 'b5', 'pantotensyra', 'pantothenic', 'binjurar', 'coenzym', 'askorbinsyra',
        'kissas', 'ut', 'diarré', 'kollagensyntes', 'glow', 'vitamin', 'd3', 'cholecalciferol',
        'högre', 'doser', 'fat-solublet', 'överdos', 'kan', 'ge', 'hyperkalcemi', 'vitamin',
        'e', 'blandade', 'tokoferoler', 'mixed', 'tocopherols', 'cellmembran', 'välj',
        'ej', 'bara', 'alfa', 'vitamin', 'k2', 'artärstelhet', 'förhindrar', 'kalcium',
        'kärl', 'waran', 'mk-7', 'viktig', 'rikta', 'skelettet', 'lång', 'halveringstid',
        'vitlök', 'garlic', 'aged', 'allicin', 'plack', 'age', 'vitpilbark', 'white', 'willow',
        'bark', 'salicin', 'naturlig', 'aspirin', 'magsår', 'salicylat', 'växtsteroler',
        'plant', 'sterols', 'blockerar', 'upptag', 'wild', 'yam', 'diosgenin', 'labbomvandling',
        'placebo', 'yerba', 'mate', 'glp-1', 'innehåller', 'teobromin', 'yohimbin', 'yohimbine',
        'hcl', 'alfa-2', 'antagonist', 'anxiety', 'hjärtklappning', 'dosera', 'försiktigt',
        'blockerare', 'hjärta', 'zink', 'zinc', 'skinläkning', 'akne', 'pikolinat', 'glycinat',
        'kopparbalans', 'kelaterad', 'lozenges', 'halsont', 'lokal', 'sugtabletter', 'acetat',
        'glukonat', 'viktig', 'mannens', 'hälsa', 'kopparbrist', 'modulerar', 'synaptisk',
        'plasticitet', 'neurotransmittor-modulering', 'insulinlagring', 'insulin-hexamerer',
        'l-carnosine', 'specifikt', 'slemhinnor', 'löses', 'långsamt', 'lokal', 'zinkpikolinat',
        'zinc', 'picolinate', 'long-termbruk', 'utmärkt', 'hämma', 'kopparupptag', 'zma',
        'återhämtning', 'populär', 'åkerfräken', 'kiselkälla', 'hårkomplex', 'äggprotein',
        'egg', 'white', 'protein', 'medelsnabbt', 'hög', 'bv', 'laktosfritt', 'alternativ',
        'äppelcidervinäger', 'apple', 'cider', 'vinegar', 'acv', 'kapslar', 'skonar',
        'tandemaljen', 'ättiksyra', 'insulinsvar', 'ärtprotein', 'pea', 'protein', 'bra',
        'aminosyraprofil', 'högt', 'arginine'
    ]
    
    # Check for Swedish words (case-insensitive)
    for word in swedish_indicators:
        if word in text_lower:
            return True
    
    # Check for Swedish status/risk terms
    if any(term in text for term in ['Grön', 'Blå', 'Röd', 'Låg', 'Hög', 'Medium']):
        return True
    
    return False

def translate_text(text, field_name="text"):
    """Translate Swedish text to English using OpenAI API."""
    if not text or text == '-' or text.strip() == '':
        return text
    
    # Always translate if it contains Swedish characters or common Swedish words
    if not has_swedish_text(text):
        # Likely already in English, just apply simple mappings
        result = text
        for swedish, english in STATUS_MAP.items():
            result = result.replace(swedish, english)
        for swedish, english in RISK_MAP.items():
            result = result.replace(swedish, english)
        return result
    
    # Retry logic for API calls
    max_retries = 5
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",  # Using mini for cost efficiency
                messages=[
                    {
                        "role": "system",
                        "content": "You are a medical translator specializing in supplement and health terminology. Translate Swedish text to English, preserving technical terms, dosages, and medical accuracy. Keep abbreviations (like BBB, SSRI, NAD+, etc.) unchanged. Only translate the text, do not add explanations."
                    },
                    {
                        "role": "user",
                        "content": f"Translate this Swedish supplement information to English. Preserve all technical terms, dosages, and abbreviations exactly:\n\n{text}"
                    }
                ],
                temperature=0.3,
                max_tokens=500,
                timeout=60  # Increased to 60 second timeout
            )
            
            translated = response.choices[0].message.content.strip()
            
            # Remove quotes if the API added them
            if translated.startswith('"') and translated.endswith('"'):
                translated = translated[1:-1]
            
            return translated
        
        except Exception as e:
            error_msg = str(e)
            if attempt < max_retries - 1:
                wait_time = (attempt + 1) * 3  # Exponential backoff: 3s, 6s, 9s, 12s
                print(f"    ⚠️  API error (attempt {attempt + 1}/{max_retries}): {error_msg[:80]}... Retrying in {wait_time}s")
                time.sleep(wait_time)
            else:
                print(f"    ✗ Failed after {max_retries} attempts, using fallback")
                # Fallback: return original with simple mappings applied
                result = text
                for swedish, english in STATUS_MAP.items():
                    result = result.replace(swedish, english)
                for swedish, english in RISK_MAP.items():
                    result = result.replace(swedish, english)
                return result

def translate_row(row, row_num, skip_if_english=False):
    """Translate a single CSV row."""
    if len(row) < 10:
        return row
    
    translated = list(row)
    
    # Column 2: research_status (simple mapping)
    if translated[2] in STATUS_MAP:
        translated[2] = STATUS_MAP[translated[2]]
    
    # Column 5: dosing_notes (always check and translate if Swedish)
    if translated[5] and translated[5] != '-':
        if has_swedish_text(translated[5]) or not skip_if_english:
            print(f"  → Translating dosing_notes...")
            translated[5] = translate_text(translated[5], "dosing_notes")
            time.sleep(0.1)  # Rate limiting
    
    # Column 6: bioavailability_notes (always check and translate if Swedish)
    if translated[6] and translated[6] != '-':
        if has_swedish_text(translated[6]) or not skip_if_english:
            print(f"  → Translating bioavailability_notes...")
            translated[6] = translate_text(translated[6], "bioavailability_notes")
            time.sleep(0.1)  # Rate limiting
    
    # Column 7: interaction_risk (translate if needed)
    if translated[7] and translated[7] != '-':
        # First apply simple mappings
        if translated[7] in RISK_MAP:
            translated[7] = RISK_MAP[translated[7]]
        elif has_swedish_text(translated[7]) or not skip_if_english:
            # May contain additional Swedish text
            print(f"  → Translating interaction_risk...")
            translated[7] = translate_text(translated[7], "interaction_risk")
            time.sleep(0.1)  # Rate limiting
    
    return translated

def main():
    output_file = 'supplements-english.csv'
    backup_file = 'supplements-english-backup.csv'
    original_file = 'Börja utforska - Börja utforska.csv'
    
    # Priority: Use existing output file if it has correct row count, otherwise use backup or original
    with open(original_file, 'r', encoding='utf-8') as f:
        original_rows = sum(1 for _ in f)
    
    # Check if output file exists - ALWAYS check for translations FIRST before copying anything
    if os.path.exists(output_file):
        with open(output_file, 'r', encoding='utf-8') as f:
            output_rows = sum(1 for _ in f)
        
        # ALWAYS check if file has any English translations (sample first 30 rows)
        # This check happens BEFORE we decide to copy over the file
        has_translations = False
        with open(output_file, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            sample_count = 0
            english_count = 0
            for row in reader:
                if len(row) >= 10 and 'name_sv' not in row[0].lower():
                    sample_count += 1
                    # Check if this row has English text (no Swedish chars in key fields)
                    # Check column 5 (dosing_notes) and 6 (bioavailability_notes)
                    row_is_english = False
                    if row[5] and row[5] != '-':
                        has_swedish_chars = any(c in row[5] for c in ['å', 'ä', 'ö', 'Å', 'Ä', 'Ö'])
                        has_swedish_words = any(word in row[5].lower() for word in ['är', 'och', 'för', 'med', 'på', 'av', 'till', 'det', 'som', 'kan', 'inte', 'eller', 'vid', 'bättre', 'högre', 'lägre', 'från', 'grön', 'blå', 'röd', 'låg', 'hög'])
                        if not has_swedish_chars and not has_swedish_words:
                            row_is_english = True
                    if row[6] and row[6] != '-':
                        has_swedish_chars = any(c in row[6] for c in ['å', 'ä', 'ö', 'Å', 'Ä', 'Ö'])
                        has_swedish_words = any(word in row[6].lower() for word in ['är', 'och', 'för', 'med', 'på', 'av', 'till', 'det', 'som', 'kan', 'inte', 'eller', 'vid', 'bättre', 'högre', 'lägre', 'från'])
                        if not has_swedish_chars and not has_swedish_words:
                            row_is_english = True
                    
                    if row_is_english:
                        english_count += 1
                    
                    if sample_count >= 30:
                        break
            # If at least 30% of sampled rows are in English, consider file partially translated
            if sample_count > 0 and english_count / sample_count >= 0.3:
                has_translations = True
        
        # If file has translations, NEVER overwrite it, regardless of row count
        if has_translations:
            print(f"✓ Using existing {output_file} with {output_rows} rows")
            if abs(output_rows - original_rows) <= 1:
                print(f"  File contains partial translations - will only translate remaining Swedish text")
            else:
                print(f"  ⚠️  Row count differs ({output_rows} vs {original_rows}), but file has translations")
                print(f"  Keeping existing file and will only translate remaining Swedish text")
            print(f"  (Skipping rows that are already fully translated)\n")
        # If file has correct row count but no translations, use it
        elif abs(output_rows - original_rows) <= 1:
            print(f"✓ Using existing {output_file} with {output_rows} rows")
            print(f"  Will only translate fields that still contain Swedish text...")
            print(f"  (Skipping rows that are already fully translated)\n")
        # File has wrong row count and no translations - can use backup or original
        elif os.path.exists(backup_file):
            with open(backup_file, 'r', encoding='utf-8') as f:
                backup_rows = sum(1 for _ in f)
            if backup_rows == original_rows:
                print(f"⚠️  {output_file} has {output_rows} rows (expected {original_rows})")
                print(f"  File has no translations - using backup file instead")
                print(f"✓ Using backup file ({backup_file}) with {backup_rows} rows")
                import shutil
                shutil.copy2(backup_file, output_file)
                print(f"  Copied backup to {output_file}\n")
            else:
                print(f"⚠️  Both files have wrong row counts. Using original file...")
                import shutil
                shutil.copy2(original_file, output_file)
                print(f"  Copied original to {output_file}\n")
        else:
            print(f"⚠️  {output_file} has {output_rows} rows (expected {original_rows})")
            print(f"   File has no translations - using original file...")
            import shutil
            shutil.copy2(original_file, output_file)
            print(f"  Copied original to {output_file}\n")
    elif os.path.exists(backup_file):
        with open(backup_file, 'r', encoding='utf-8') as f:
            backup_rows = sum(1 for _ in f)
        if backup_rows == original_rows:
            print(f"✓ Using backup file ({backup_file}) with {backup_rows} rows as starting point")
            import shutil
            shutil.copy2(backup_file, output_file)
            print(f"  Copied backup to {output_file}\n")
        else:
            print(f"⚠️  Backup file has {backup_rows} rows (expected {original_rows})")
            print(f"   Using original file...")
            import shutil
            shutil.copy2(original_file, output_file)
            print(f"  Copied original to {output_file}\n")
    else:
        print(f"Starting fresh translation from {original_file}...")
        import shutil
        shutil.copy2(original_file, output_file)
        print(f"  Copied original to {output_file}\n")
    
    rows = []
    total_rows = 0
    translated_count = 0
    needs_translation_count = 0
    
    print(f"\nReading CSV file: {output_file}...")
    with open(output_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        for row_num, row in enumerate(reader, 1):
            if len(row) > 0 and 'name_sv' in row[0].lower():
                # Header row - keep as is
                rows.append(row)
                print(f"Found header row at line {row_num}")
            elif len(row) >= 10:
                # Data row - check if it needs translation
                total_rows += 1
                
                try:
                    # Check if any field still has Swedish text
                    needs_translation = False
                    swedish_fields = []
                    
                    if row[5] and row[5] != '-' and has_swedish_text(row[5]):
                        needs_translation = True
                        swedish_fields.append('dosing_notes')
                    if row[6] and row[6] != '-' and has_swedish_text(row[6]):
                        needs_translation = True
                        swedish_fields.append('bioavailability_notes')
                    if row[7] and row[7] != '-':
                        # Check if it's just a simple status that needs mapping
                        if row[7] in RISK_MAP:
                            # Just needs simple mapping, not full translation
                            pass
                        elif has_swedish_text(row[7]):
                            needs_translation = True
                            swedish_fields.append('interaction_risk')
                    
                    if needs_translation:
                        needs_translation_count += 1
                        print(f"\nRow {row_num}: Needs translation ({', '.join(swedish_fields)})")
                        translated = translate_row(row, row_num, skip_if_english=True)
                        rows.append(translated)
                        translated_count += 1
                    else:
                        # Already translated, just apply simple mappings and skip
                        translated = list(row)
                        if translated[2] in STATUS_MAP:
                            translated[2] = STATUS_MAP[translated[2]]
                        if translated[7] in RISK_MAP:
                            translated[7] = RISK_MAP[translated[7]]
                        rows.append(translated)
                        # Skip silently - no need to print for already translated rows
                        if total_rows % 100 == 0:  # Show progress every 100 skipped rows
                            print(f"  ... {total_rows} rows processed (skipping already translated rows)")
                    
                    # Progress update and save every 10 rows (more frequent saves)
                    if total_rows % 10 == 0:
                        print(f"\n=== Progress: {total_rows} rows processed, {translated_count} translated ===")
                        # Save progress periodically to temp file first, then rename (safer)
                        try:
                            temp_file = output_file + '.tmp'
                            with open(temp_file, 'w', encoding='utf-8', newline='') as f:
                                writer = csv.writer(f)
                                writer.writerows(rows)
                            # Atomic rename
                            os.replace(temp_file, output_file)
                            print(f"  ✓ Progress saved to {output_file}\n")
                        except Exception as e:
                            print(f"  ✗ Error saving progress: {e}\n")
                
                except KeyboardInterrupt:
                    print(f"\n\n⚠️  Interrupted by user. Saving progress...")
                    try:
                        temp_file = output_file + '.tmp'
                        with open(temp_file, 'w', encoding='utf-8', newline='') as f:
                            writer = csv.writer(f)
                            writer.writerows(rows)
                        os.replace(temp_file, output_file)
                        print(f"  ✓ Progress saved ({total_rows} rows). You can resume by running the script again.")
                    except Exception as e:
                        print(f"  ✗ Error saving: {e}")
                    sys.exit(0)
                except Exception as e:
                    print(f"\n  ✗ Error processing row {row_num}: {e}")
                    print(f"  Continuing with next row...")
                    # Add row as-is to prevent data loss
                    rows.append(row)
            else:
                # Keep malformed rows as-is
                rows.append(row)
    
    print(f"\nWriting final translated CSV to {output_file}...")
    try:
        temp_file = output_file + '.tmp'
        with open(temp_file, 'w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            writer.writerows(rows)
        os.replace(temp_file, output_file)
    except Exception as e:
        print(f"  ✗ Error writing final file: {e}")
        raise
    
    skipped_count = total_rows - needs_translation_count
    print(f"\n{'='*60}")
    print(f"✓ Translation complete!")
    print(f"{'='*60}")
    print(f"  Total data rows: {total_rows}")
    print(f"  Rows already translated (skipped): {skipped_count}")
    print(f"  Rows needing translation: {needs_translation_count}")
    print(f"  Rows translated in this run: {translated_count}")
    print(f"  Output file: {output_file}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
