#!/usr/bin/env python3
"""
Translate only specific cells in CSV that contain Swedish text.
Updates only those cells, does not rewrite the entire file.
"""

import csv
import os
import sys
import time
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv('.env.local')
load_dotenv('.env')

# Initialize OpenAI client
api_key = (
    os.getenv('OPENAI_API_KEY') or 
    os.getenv('OPENAI_KEY') or 
    os.getenv('OAI_API_KEY')
)

if not api_key:
    print("Error: OpenAI API key not found!")
    sys.exit(1)

client = OpenAI(api_key=api_key)

# Simple mappings
STATUS_MAP = {'Grön': 'Green', 'Blå': 'Blue', 'Röd': 'Red'}
RISK_MAP = {'Låg': 'Low', 'Medium': 'Medium', 'Hög': 'High'}

def has_swedish_text(text):
    """Check if text contains Swedish words or characters."""
    if not text or text == '-' or text.strip() == '':
        return False
    
    text_lower = text.lower()
    swedish_chars = ['å', 'ä', 'ö', 'Å', 'Ä', 'Ö']
    
    if any(char in text for char in swedish_chars):
        return True
    
    # Common Swedish words
    swedish_words = ['grön', 'blå', 'röd', 'låg', 'hög', 'är', 'och', 'för', 'med', 'på', 'av', 'till', 'det', 'som', 'kan', 'inte', 'eller', 'vid', 'bättre', 'högre', 'lägre', 'från']
    
    if any(word in text_lower for word in swedish_words):
        return True
    
    return False

def translate_text(text):
    """Translate Swedish text to English using OpenAI API."""
    if not text or text == '-':
        return text
    
    # Simple mappings first
    if text in STATUS_MAP:
        return STATUS_MAP[text]
    if text in RISK_MAP:
        return RISK_MAP[text]
    
    if not has_swedish_text(text):
        return text
    
    # API translation
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a medical translator. Translate Swedish supplement text to English. Preserve technical terms, dosages, and abbreviations (BBB, SSRI, NAD+, etc.). Only translate, no explanations."
                    },
                    {
                        "role": "user",
                        "content": f"Translate to English:\n\n{text}"
                    }
                ],
                temperature=0.3,
                max_tokens=300,
                timeout=30
            )
            
            translated = response.choices[0].message.content.strip()
            if translated.startswith('"') and translated.endswith('"'):
                translated = translated[1:-1]
            return translated
        
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(2)
            else:
                print(f"    ✗ Failed to translate: {text[:50]}")
                return text  # Return original on failure

def main():
    csv_file = 'supplements-english.csv'
    
    # Read all rows
    rows = []
    cells_to_translate = []
    
    print(f"Reading {csv_file}...")
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        for row_num, row in enumerate(reader, 1):
            rows.append(row)
            
            if len(row) >= 10 and 'name_sv' not in row[0].lower():
                # Check each column that needs translation
                for col_idx in [2, 5, 6, 7]:
                    if col_idx < len(row) and row[col_idx] and row[col_idx] != '-':
                        text = row[col_idx]
                        # ONLY translate if it's actually Swedish - don't overwrite English
                        # Simple status/risk mappings are OK to do
                        if text in STATUS_MAP:
                            cells_to_translate.append((row_num - 1, col_idx, text))
                        elif text in RISK_MAP:
                            cells_to_translate.append((row_num - 1, col_idx, text))
                        elif has_swedish_text(text):
                            # Double-check it's not already English
                            if not (text.lower() in ['low', 'medium', 'high', 'green', 'blue', 'red']):
                                cells_to_translate.append((row_num - 1, col_idx, text))
    
    print(f"\nFound {len(cells_to_translate)} cells that need translation")
    print(f"Translating only these specific cells...\n")
    
    # Translate each cell
    translated_count = 0
    for idx, (row_idx, col_idx, original_text) in enumerate(cells_to_translate, 1):
        print(f"[{idx}/{len(cells_to_translate)}] Row {row_idx + 1}, Column {col_idx}: {original_text[:60]}...")
        
        translated = translate_text(original_text)
        rows[row_idx][col_idx] = translated
        translated_count += 1
        
        if translated != original_text:
            print(f"  → {translated[:60]}")
        
        # Save every 50 cells
        if idx % 50 == 0:
            print(f"\n  Saving progress... ({idx}/{len(cells_to_translate)} translated)")
            temp_file = csv_file + '.tmp'
            with open(temp_file, 'w', encoding='utf-8', newline='') as f:
                writer = csv.writer(f)
                writer.writerows(rows)
            os.replace(temp_file, csv_file)
        
        time.sleep(0.2)  # Rate limiting
    
    # Final save
    print(f"\nSaving final version...")
    temp_file = csv_file + '.tmp'
    with open(temp_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(rows)
    os.replace(temp_file, csv_file)
    
    print(f"\n✅ Complete! Translated {translated_count} cells.")
    print(f"✅ Updated only the specific cells in {csv_file}")

if __name__ == '__main__':
    main()
