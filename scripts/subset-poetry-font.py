"""Regenerate the small self-hosted reading font after adding new writings.

Requires: python3 -m pip install fonttools brotli
The generated font is committed as an asset; ordinary npm builds need no Python.
"""
from pathlib import Path
from fontTools import subset

root = Path(__file__).resolve().parent.parent
characters = ''.join(
    path.read_text() for path in (root / 'src').rglob('*')
    if path.suffix in {'.ts', '.tsx', '.css'}
) + ''.join(chr(i) for i in range(32, 127))
source = root / 'node_modules/@fontsource/lxgw-wenkai/files/lxgw-wenkai-latin-500-normal.woff2'
destination = root / 'src/assets/poetry-handwriting.woff2'
destination.parent.mkdir(parents=True, exist_ok=True)
options = subset.Options()
options.flavor = 'woff2'
font = subset.load_font(str(source), options)
worker = subset.Subsetter(options=options)
worker.populate(text=characters)
worker.subset(font)
subset.save_font(font, str(destination), options)
print(f'Generated reading font: {destination.stat().st_size} bytes')
