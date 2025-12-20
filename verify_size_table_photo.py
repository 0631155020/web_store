
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('http://localhost:8000/product-detail.html')
    page.screenshot(path='verification.png')
    browser.close()
