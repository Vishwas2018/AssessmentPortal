// vite.config.ts
// Configuration with proper path aliases for Vercel/Netlify deployment
// FIXED: Removed __REACT_DEVTOOLS_GLOBAL_HOOK__ define that caused crash
// ============================================

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  // Path aliases - CRITICAL for build to work
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Build configuration
  build: {
    // Output directory
    outDir: "dist",

    // Generate source maps for debugging (optional)
    sourcemap: false,

    // Rollup options
    rollupOptions: {
      output: {
        // Chunk splitting for better caching
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": ["framer-motion", "lucide-react"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },

    // Target modern browsers
    target: "esnext",

    // Minification
    minify: "esbuild",
  },

  // Development server configuration
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    open: true,
  },

  // Preview server (for testing production build locally)
  preview: {
    port: 4173,
    strictPort: false,
  },

  // Environment variable prefix
  envPrefix: "VITE_",
});
