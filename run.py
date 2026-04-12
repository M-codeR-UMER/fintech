import subprocess
import sys
import os
import signal
import time

def run_project():
    print("🚀 Starting FinPay Project...")

    # 1. Start Backend
    print("📡 Starting Backend (FastAPI)...")
    backend_proc = subprocess.Popen(
        [sys.executable, "main.py"],
        cwd=os.path.join(os.getcwd(), "backend")
    )

    # 2. Start Frontend
    print("💻 Starting Frontend (Vite)...")
    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=os.getcwd(),
        shell=True
    )

    def signal_handler(sig, frame):
        print("\n🛑 Shutting down servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)

    print("\n✅ Project is running!")
    print("🔗 Frontend: http://localhost:5173")
    print("🔗 Backend:  http://localhost:8001")
    print("Press Ctrl+C to stop both servers.\n")

    # Keep the script alive and print logs if needed
    try:
        while True:
            # You can optionally read line-by-line here if you want to see logs in this terminal
            time.sleep(1)
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    run_project()
