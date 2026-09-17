#!/usr/bin/env python3
"""Tiny CORS-open POST sink so the SoleGen tab can drop generated STLs here."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

OUT = Path(__file__).resolve().parents[1] / "demo-stls"
OUT.mkdir(exist_ok=True)
PORT = 8742


class H(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_POST(self):
        q = parse_qs(urlparse(self.path).query)
        name = (q.get("name") or ["unnamed"])[0]
        n = int(self.headers.get("Content-Length", "0"))
        data = self.rfile.read(n)
        dest = OUT / f"{name}.stl"
        dest.write_bytes(data)
        self.send_response(200)
        self._cors()
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(f"wrote {dest.name} {len(data)}\n".encode())
        print(f"wrote {dest} {len(data)}", flush=True)

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    print(f"recv STLs on http://127.0.0.1:{PORT} -> {OUT}", flush=True)
    ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()
