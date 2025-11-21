import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    port: 5173, // Explicitly set port to avoid confusion
    host: "0.0.0.0", // Listen on all interfaces
    open: true, // Don't automatically open browser
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        ws: true,
        // Ensure cookies are forwarded in both directions
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            // Forward cookies from the original request to backend
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });

          // Forward Set-Cookie headers from backend response to client
          proxy.on("proxyRes", (proxyRes, req, res) => {
            const setCookieHeaders = proxyRes.headers["set-cookie"];
            if (setCookieHeaders) {
              res.setHeader("Set-Cookie", setCookieHeaders);
            }
          });
        },
      },
    },
  },
});
