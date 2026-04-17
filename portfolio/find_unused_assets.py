import os
import re

# Get all assets
assets_dir = 'public/assets'
all_assets = []
for root, dirs, files in os.walk(assets_dir):
    for file in files:
        if file != '.DS_Store' and not file.endswith('.md'):
            full_path = os.path.join(root, file)
            # Make path relative to public/ e.g. /assets/...
            rel_path = '/' + full_path.replace('public/', '')
            all_assets.append(rel_path)

# Get all source files
src_dir = 'src'
src_files = []
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.ts', '.tsx', '.css', '.js', '.jsx')):
            src_files.append(os.path.join(root, file))

# Also check public/assets for cross-references (like HTML files referencing images, though unlikely to be kept)
# Actually, we should just check the whole src directory.
# Plus the site-content.ts which is the main place.

# Read all content
content = ""
for file in src_files:
    with open(file, 'r', encoding='utf-8', errors='ignore') as f:
        content += f.read() + "\n"

# Check which assets are used
unused_assets = []
for asset in all_assets:
    # Check if the filename or the path is in the content
    filename = os.path.basename(asset)
    
    # Simple check: is the exact path in the content?
    if asset in content:
        continue
        
    # Is the filename in the content? (might be constructed dynamically)
    if filename in content:
        continue
        
    # If not found, it's unused
    unused_assets.append(asset)

print("Unused assets:")
for asset in unused_assets:
    print(asset)
