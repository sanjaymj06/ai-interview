#!/bin/bash
echo "============================================"
echo "  AI Interview Analyzer - Starting Server"
echo "============================================"
echo

cd "$(dirname "$0")"

echo "[1/2] Installing dependencies..."
pip install -r requirements.txt -q

echo "[2/2] Starting server..."
echo
echo "  Open http://localhost:5000 in your browser"
echo "  Press Ctrl+C to stop the server"
echo
python app.py
