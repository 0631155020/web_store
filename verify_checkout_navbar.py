from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:8000/static/checkout.html", wait_until="networkidle")

    # Wait for the navbar to be loaded
    try:
        page.wait_for_selector('#navbar', timeout=10000)
    except:
        print("Navbar not found after waiting")
        page.screenshot(path="checkout_navbar_fail.png")
        browser.close()
        return

    # Check the width of the navbar's parent section
    navbar_section = page.query_selector('#header')
    if not navbar_section:
        print("Navbar section (#header) not found")
        browser.close()
        return

    bounding_box = navbar_section.bounding_box()
    if not bounding_box:
        print("Could not get navbar section bounding box")
        browser.close()
        return

    viewport_size = page.viewport_size
    if not viewport_size:
        print("Could not get viewport size")
        browser.close()
        return

    print(f"Navbar section width: {bounding_box['width']}")
    print(f"Viewport width: {viewport_size['width']}")

    # Assert that the navbar width is close to the viewport width
    assert abs(bounding_box['width'] - viewport_size['width']) < 20
    print("Navbar is full-width.")

    # Check for the language switcher
    language_switcher = page.query_selector('.language-switcher-container')
    if not language_switcher:
        print("Language switcher not found")
        page.screenshot(path="checkout_navbar_fail.png")
        browser.close()
        return

    assert language_switcher.is_visible()
    print("Language switcher is visible.")

    page.screenshot(path="checkout_navbar_verification.png")
    print("Screenshot saved to checkout_navbar_verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
