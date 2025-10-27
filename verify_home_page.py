import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("http://localhost:8000")
        await page.wait_for_selector(".gallery-container .gallery-item")

        # Take screenshot
        screenshot_path = "home_page_no_delete_button.png"
        await page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        # Check for delete button
        html_content = await page.content()
        soup = BeautifulSoup(html_content, 'html.parser')
        delete_buttons = soup.select('button.delete-btn') # Assuming delete button has class 'delete-btn'

        if not delete_buttons:
            print("Verification successful: No delete buttons found on the home page.")
        else:
            print(f"Verification failed: Found {len(delete_buttons)} delete button(s) on the home page.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
