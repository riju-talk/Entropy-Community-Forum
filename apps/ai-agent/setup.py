"""
Setup script to create required directories and perform initial setup
"""
import os
from pathlib import Path

def setup_directories():
    # Create data directories
    data_dirs = [
        Path("data/chroma_db"),
        Path("data/uploads")
    ]
    
    for dir_path in data_dirs:
        dir_path.mkdir(parents=True, exist_ok=True)
        print(f"✅ Created directory: {dir_path}")

if __name__ == "__main__":
    print("🚀 Setting up AI Agent development environment...")
    setup_directories()
    print("\n✨ Setup complete! You can now run 'npm run dev'")
