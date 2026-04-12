import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options

def capture_screenshot(url, output_path):
    # Ensure the directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Configure Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in background
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--hide-scrollbars")

    # Initialize the driver
    print(f"Connecting to {url}...")
    driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=chrome_options)

    try:
        driver.get(url)
        # Give the page time to load (adjust if your app is slow)
        time.sleep(5) 
        
        # Save the screenshot
        driver.save_screenshot(output_path)
        print(f"Screenshot successfully saved to: {output_path}")
    except Exception as e:
        print(f"Error capturing screenshot: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    TARGET_URL = "http://localhost:5173/"
    OUTPUT_FILE = "images/app_screenshot.png"
    capture_screenshot(TARGET_URL, OUTPUT_FILE)
