import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: "es2022",
    rollupOptions: {
      output: {
        manualChunks: {
          maplibre: ["maplibre-gl"],
          turf: [
            "@turf/area",
            "@turf/bbox",
            "@turf/boolean-intersects",
            "@turf/boolean-point-in-polygon",
            "@turf/buffer",
            "@turf/centroid",
            "@turf/distance",
            "@turf/helpers",
            "@turf/intersect",
            "@turf/length",
            "@turf/nearest-point",
            "@turf/nearest-point-on-line",
            "@turf/voronoi",
          ],
        },
      },
    },
  },
});
