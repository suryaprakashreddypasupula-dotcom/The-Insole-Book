#!/usr/bin/env python3
"""Static server for The Hike Insole Book with no-cache headers,
so edits to the book always show up on reload."""
import http.server
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8471
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, must-revalidate")
        super().end_headers()

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    with http.server.ThreadingHTTPServer(("127.0.0.1", PORT), NoCacheHandler) as srv:
        print(f"serving {ROOT} on http://localhost:{PORT}")
        srv.serve_forever()
