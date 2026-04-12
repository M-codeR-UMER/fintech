import os
import sys
import time
import argparse
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options

def capture_screenshot(url, output_path):
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--hide-scrollbars")
    print(f"Connecting to {url}...")
    driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=chrome_options)
    try:
        driver.get(url)
        time.sleep(5) 
        driver.save_screenshot(output_path)
        print(f"Screenshot successfully saved to: {output_path}")
    except Exception as e:
        print(f"Error capturing screenshot: {e}")
        sys.exit(1)
    finally:
        driver.quit()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Capture screenshot of a URL')
    parser.add_argument('--url', type=str, required=True, help='URL to capture')
    parser.add_argument('--output', type=str, default='qa_screenshot.png', help='Output file path')
    args = parser.parse_args()
    capture_screenshot(args.url, args.output)