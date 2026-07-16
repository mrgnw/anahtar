# /// script
# requires-python = ">=3.12"
# dependencies = ["playwright"]
# ///
import pathlib
import sys

from playwright.sync_api import sync_playwright

html = pathlib.Path(sys.argv[1]).resolve()
outdir = pathlib.Path(sys.argv[2])
outdir.mkdir(parents=True, exist_ok=True)
cases = ['idle', 'after', 'before']

with sync_playwright() as p:
	browser = p.chromium.launch()
	page = browser.new_page(viewport={'width': 1200, 'height': 620}, device_scale_factor=2)
	for cid in cases:
		page.goto(f'file://{html}#{cid}')
		page.wait_for_timeout(250)
		out = outdir / f'go-{cid}.png'
		page.screenshot(path=str(out))
		print(f'wrote {out}')
	browser.close()
