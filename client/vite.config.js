import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-icons")) {
              return "vendor-icons";
            }
            if (id.includes("framer-motion") || id.includes("gsap") || id.includes("lenis")) {
              return "vendor-animation";
            }
            if (id.includes("socket.io-client") || id.includes("axios")) {
              return "vendor-network";
            }
            if (id.includes("react-router-dom") || id.includes("react-dom") || id.includes("react")) {
              return "vendor-react";
            }
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});