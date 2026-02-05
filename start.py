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
    root_dir = os.getcwd()
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")
    
    # 1. Start Backend
    print("Starting Backend...")
    python_exec = get_venv_python_path(backend_dir)
    env = os.environ.copy()
    
    # Ensure PYTHONPATH includes the backend directory
    # env["PYTHONPATH"] = backend_dir # app.py handles imports relative to its location usually if cwd is right
    
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
        bufsize=1  # Line buffered
    )
    print(f"Backend started with PID {backend_process.pid}")

    # Start threads to stream output
    def stream_output(pipe, prefix):
        # Use utf-8 with replacement for any potential decoding errors
        for line in iter(lambda: pipe.readline(), ''):
            print(f"{prefix} {line}", end='')
    
    Thread(target=stream_output, args=(backend_process.stdout, "[BACKEND]"), daemon=True).start()
    Thread(target=stream_output, args=(backend_process.stderr, "[BACKEND ERROR]"), daemon=True).start()

    # 2. Start Frontend
    print("Starting Frontend...")
    npm_cmd = get_npm_command()
    
    frontend_process = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=frontend_dir,
        shell=False, # Shell=True sometimes helps with npm on windows but npm.cmd should work with False
        # Capture output for streaming
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )
    print(f"Frontend started with PID {frontend_process.pid}")

    Thread(target=stream_output, args=(frontend_process.stdout, "[FRONTEND]"), daemon=True).start()
    Thread(target=stream_output, args=(frontend_process.stderr, "[FRONTEND ERROR]"), daemon=True).start()

    print("\n---------------------------------------------------")
    print("🚀 Project is running!")
    print("Backend: http://localhost:5001 (or configured port)")
    print("Frontend: http://localhost:5173 (usually)")
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
