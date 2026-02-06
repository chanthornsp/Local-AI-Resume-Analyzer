import os
import subprocess
import sys
import platform
import signal
import time
from threading import Thread

def get_venv_python_path(backend_dir):
    """
    Get the path to the Python executable within the virtual environment.
    """
    system = platform.system()
    venv_dir = os.path.join(backend_dir, "venv")
    
    if system == "Windows":
        python_path = os.path.join(venv_dir, "Scripts", "python.exe")
    else:
        python_path = os.path.join(venv_dir, "bin", "python")
        
    if os.path.exists(python_path):
        return python_path
    else:
        print(f"Warning: Virtual environment not found at {venv_dir}. Using system python.")
        return sys.executable

def get_npm_command():
    """
    Get the appropriate npm command based on the OS.
    """
    system = platform.system()
    if system == "Windows":
        return "npm.cmd"
    else:
        return "npm"

def stream_output(process, prefix):
    """
    Stream output from a subprocess to stdout with a prefix.
    """
    for line in iter(process.stdout.readline, ''):
        if line:
            print(f"[{prefix}] {line.strip()}")
    process.stdout.close()

def main():
    # Force stdout to use utf-8 to support emojis
    if sys.stdout.encoding != 'utf-8':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except AttributeError:
            pass

    # Check for production mode
    is_prod = "--prod" in sys.argv

    root_dir = os.getcwd()
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")
    
    # 1. Start Backend
    print("Starting Backend...")
    python_exec = get_venv_python_path(backend_dir)
    env = os.environ.copy()
    
    # Ensure PYTHONPATH includes the backend directory
    # env["PYTHONPATH"] = backend_dir 
    
    # Force UTF-8 encoding for output
    env["PYTHONIOENCODING"] = "utf-8"

    backend_process = subprocess.Popen(
        [python_exec, "app.py"],
        cwd=backend_dir,
        env=env,
        shell=False,
        # Capture output for streaming
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding='utf-8', # Explicitly read as UTF-8
        bufsize=1  # Line buffered
    )
    print(f"Backend started with PID {backend_process.pid}")

    # Start threads to stream output
    def stream_output_thread(pipe, prefix):
        try:
            for line in iter(pipe.readline, ''):
                if not line: break
                try:
                    print(f"{prefix} {line}", end='')
                except UnicodeEncodeError:
                    # Fallback for terminals that can't handle the emoji
                    sanitized = line.encode('ascii', 'replace').decode('ascii')
                    print(f"{prefix} {sanitized}", end='')
        except ValueError:
            pass # Handle closed pipe
    
    Thread(target=stream_output_thread, args=(backend_process.stdout, "[BACKEND]"), daemon=True).start()
    Thread(target=stream_output_thread, args=(backend_process.stderr, "[BACKEND LOGS]"), daemon=True).start()

    # 2. Start Frontend
    print("Starting Frontend...")
    npm_cmd = get_npm_command()
    
    if is_prod:
        print("🏗️  Building Frontend for Production...")
        try:
            # Run build synchronously
            # Use shell=True specifically on Windows if needed, but often npm.cmd handles it.
            # We'll use shell=False with npm.cmd which works reliably.
            subprocess.run([npm_cmd, "run", "build"], cwd=frontend_dir, shell=False, check=True)
            print("✅ Build successful!")
            
            print("Starting Frontend (Preview Mode)...")
            frontend_cmd = [npm_cmd, "run", "preview"]
        except subprocess.CalledProcessError:
            print("❌ Build failed. Aborting.")
            backend_process.terminate()
            return
    else:
        print("Starting Frontend (Dev Mode)...")
        frontend_cmd = [npm_cmd, "run", "dev"]

    frontend_process = subprocess.Popen(
        frontend_cmd,
        cwd=frontend_dir,
        shell=False, 
        # Capture output for streaming
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding='utf-8', 
        bufsize=1
    )
    print(f"Frontend started with PID {frontend_process.pid}")

    Thread(target=stream_output_thread, args=(frontend_process.stdout, "[FRONTEND]"), daemon=True).start()
    Thread(target=stream_output_thread, args=(frontend_process.stderr, "[FRONTEND ERROR]"), daemon=True).start()

    print("\n---------------------------------------------------")
    print(f"🚀 Project is running ({'PRODUCTION' if is_prod else 'DEV'} MODE)!")
    print("Backend: http://localhost:5001 (or configured port)")
    print(f"Frontend: http://localhost:{'4173' if is_prod else '5173'} (usually)")
    print("Press Ctrl+C to stop both servers.")
    print("---------------------------------------------------\n")

    try:
        # Wait for processes to complete (they shouldn't unless crashed/stopped)
        while True:
            time.sleep(1)
            if backend_process.poll() is not None:
                print("Backend process ended unexpectedly.")
                break
            if frontend_process.poll() is not None:
                print("Frontend process ended unexpectedly.")
                break
    except KeyboardInterrupt:
        print("\nStopping servers...")
    finally:
        # Terminate backend
        if backend_process.poll() is None:
            print("Terminating Backend...")
            backend_process.terminate()
            try:
                backend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                backend_process.kill()
        
        # Terminate frontend
        if frontend_process.poll() is None:
            print("Terminating Frontend...")
            # On Windows, terminating the parent npm process might not kill the child node process
            # But usually it propagates enough for dev environment
            frontend_process.terminate()
            try:
                frontend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                frontend_process.kill()
        
        print("Servers stopped.")

if __name__ == "__main__":
    main()
