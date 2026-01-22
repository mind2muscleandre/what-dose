#!/usr/bin/env python3
"""
Script to generate app icons in various sizes from a source image.
Usage: python scripts/generate-icons.py <source-image-path>
"""

import sys
from PIL import Image
import os

def generate_icons(source_path, output_dir="public"):
    """Generate icons in various sizes from source image."""
    
    if not os.path.exists(source_path):
        print(f"Error: Source image not found at {source_path}")
        return False
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Open source image
    try:
        img = Image.open(source_path)
    except Exception as e:
        print(f"Error opening image: {e}")
        return False
    
    # Convert to RGBA if needed (for transparency support)
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Define icon sizes
    icon_sizes = {
        'icon-192x192.png': 192,
        'icon-512x512.png': 512,
        'apple-icon-180x180.png': 180,
        'apple-icon.png': 180,  # Same as 180x180
        'icon-light-32x32.png': 32,
        'icon-dark-32x32.png': 32,
    }
    
    print(f"Generating icons from {source_path}...")
    
    # Generate each icon size
    for filename, size in icon_sizes.items():
        # Resize image with high-quality resampling
        resized = img.resize((size, size), Image.Resampling.LANCZOS)
        
        # Save icon
        output_path = os.path.join(output_dir, filename)
        resized.save(output_path, 'PNG', optimize=True)
        print(f"  ✓ Created {output_path} ({size}x{size})")
    
    # Create SVG version (simplified - just a reference to PNG)
    # For a proper SVG, you'd need to vectorize the image
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <image href="/icon-512x512.png" width="512" height="512"/>
</svg>'''
    
    svg_path = os.path.join(output_dir, 'icon.svg')
    with open(svg_path, 'w') as f:
        f.write(svg_content)
    print(f"  ✓ Created {svg_path}")
    
    print("\n✅ All icons generated successfully!")
    print(f"   Icons saved to: {output_dir}/")
    
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/generate-icons.py <source-image-path>")
        print("\nExample:")
        print("  python scripts/generate-icons.py ~/Downloads/app-icon.png")
        sys.exit(1)
    
    source_image = sys.argv[1]
    success = generate_icons(source_image)
    sys.exit(0 if success else 1)
