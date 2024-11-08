// vite.config.mjs
import vue from "file:///C:/App/app/MatchupX/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import ViteImagemin from "file:///C:/App/app/MatchupX/node_modules/vite-plugin-imagemin/dist/index.mjs";
import { defineConfig } from "file:///C:/App/app/MatchupX/node_modules/vite/dist/node/index.js";
import electron from "file:///C:/App/app/MatchupX/node_modules/vite-plugin-electron/dist/index.mjs";
var vite_config_default = defineConfig({
  mode: process.env.NODE_ENV || "development",
  // Ensure mode is set correctly
  server: {
    port: 3002,
    hmr: true
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      // Your rollup options here
    }
  },
  plugins: [
    vue(),
    electron({
      entry: "src/main.js"
      // Path to your Electron main process entry
    }),
    ViteImagemin({
      mozjpeg: {
        quality: 75
      },
      pngquant: {
        quality: [0.65, 0.9],
        speed: 4
      },
      svgo: {
        plugins: [{ removeViewBox: false }]
      }
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcQXBwXFxcXGFwcFxcXFxNYXRjaHVwWFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcQXBwXFxcXGFwcFxcXFxNYXRjaHVwWFxcXFx2aXRlLmNvbmZpZy5tanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L0FwcC9hcHAvTWF0Y2h1cFgvdml0ZS5jb25maWcubWpzXCI7aW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnO1xyXG5pbXBvcnQgVml0ZUltYWdlbWluIGZyb20gJ3ZpdGUtcGx1Z2luLWltYWdlbWluJztcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCBlbGVjdHJvbiBmcm9tICd2aXRlLXBsdWdpbi1lbGVjdHJvbic7XHJcblxyXG4vLyB2aXRlLmNvbmZpZy5qc1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIG1vZGU6IHByb2Nlc3MuZW52Lk5PREVfRU5WIHx8ICdkZXZlbG9wbWVudCcsIC8vIEVuc3VyZSBtb2RlIGlzIHNldCBjb3JyZWN0bHlcclxuICBzZXJ2ZXI6IHtcclxuICAgIHBvcnQ6IDMwMDIsXHJcbiAgICBobXI6IHRydWUsXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgc291cmNlbWFwOiB0cnVlLFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAvLyBZb3VyIHJvbGx1cCBvcHRpb25zIGhlcmVcclxuICAgIH1cclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHZ1ZSgpLFxyXG4gICAgZWxlY3Ryb24oe1xyXG4gICAgICBlbnRyeTogJ3NyYy9tYWluLmpzJywgLy8gUGF0aCB0byB5b3VyIEVsZWN0cm9uIG1haW4gcHJvY2VzcyBlbnRyeVxyXG4gICAgfSksXHJcbiAgICBWaXRlSW1hZ2VtaW4oe1xyXG4gICAgICBtb3pqcGVnOiB7XHJcbiAgICAgICAgcXVhbGl0eTogNzUsXHJcbiAgICAgIH0sXHJcbiAgICAgIHBuZ3F1YW50OiB7XHJcbiAgICAgICAgcXVhbGl0eTogWzAuNjUsIDAuOV0sXHJcbiAgICAgICAgc3BlZWQ6IDQsXHJcbiAgICAgIH0sXHJcbiAgICAgIHN2Z286IHtcclxuICAgICAgICBwbHVnaW5zOiBbeyByZW1vdmVWaWV3Qm94OiBmYWxzZSB9XSxcclxuICAgICAgfSxcclxuICAgIH0pLFxyXG4gIF0sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXFQLE9BQU8sU0FBUztBQUNyUSxPQUFPLGtCQUFrQjtBQUN6QixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLGNBQWM7QUFHckIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsTUFBTSxRQUFRLElBQUksWUFBWTtBQUFBO0FBQUEsRUFDOUIsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sS0FBSztBQUFBLEVBQ1A7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFdBQVc7QUFBQSxJQUNYLGVBQWU7QUFBQTtBQUFBLElBRWY7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsSUFDSixTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUE7QUFBQSxJQUNULENBQUM7QUFBQSxJQUNELGFBQWE7QUFBQSxNQUNYLFNBQVM7QUFBQSxRQUNQLFNBQVM7QUFBQSxNQUNYO0FBQUEsTUFDQSxVQUFVO0FBQUEsUUFDUixTQUFTLENBQUMsTUFBTSxHQUFHO0FBQUEsUUFDbkIsT0FBTztBQUFBLE1BQ1Q7QUFBQSxNQUNBLE1BQU07QUFBQSxRQUNKLFNBQVMsQ0FBQyxFQUFFLGVBQWUsTUFBTSxDQUFDO0FBQUEsTUFDcEM7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
