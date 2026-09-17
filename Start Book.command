#!/bin/zsh
# Double-click to open The Hike Insole Book.
# Starts a tiny local web server (needed so the browser can load the 3D models),
# then opens the book in your default browser. Everything stays on this Mac.
cd "$(dirname "$0")"
PORT=8471
if ! lsof -i :$PORT >/dev/null 2>&1; then
  /usr/bin/python3 tools/serve.py $PORT >/dev/null 2>&1 &
  sleep 1
fi
open "http://localhost:$PORT/index.html"
