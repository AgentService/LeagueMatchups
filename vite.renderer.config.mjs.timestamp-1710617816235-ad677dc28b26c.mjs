// vite.renderer.config.mjs
import { defineConfig } from "file:///C:/App/app/MatchupX/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/App/app/MatchupX/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import ViteImagemin from "file:///C:/App/app/MatchupX/node_modules/vite-plugin-imagemin/dist/index.mjs";
var vite_renderer_config_default = defineConfig({
  mode: "production",
  // This sets NODE_ENV to production
  plugins: [
    vue(),
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
  ],
  build: {
    outDir: "dist/renderer",
    rollupOptions: {
      input: {
        main_window: "src/renderer/main.js"
        // Specify the entry point for your renderer
      }
    }
  }
});
export {
  vite_renderer_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5yZW5kZXJlci5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcQXBwXFxcXGFwcFxcXFxNYXRjaHVwWFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcQXBwXFxcXGFwcFxcXFxNYXRjaHVwWFxcXFx2aXRlLnJlbmRlcmVyLmNvbmZpZy5tanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L0FwcC9hcHAvTWF0Y2h1cFgvdml0ZS5yZW5kZXJlci5jb25maWcubWpzXCI7Ly92aXRlLnJlbmRlcmVyLmNvbmZpZy5tanNcclxuXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCB2dWUgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXZ1ZVwiO1xyXG5pbXBvcnQgVml0ZUltYWdlbWluIGZyb20gXCJ2aXRlLXBsdWdpbi1pbWFnZW1pblwiO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBtb2RlOiBcInByb2R1Y3Rpb25cIiwgLy8gVGhpcyBzZXRzIE5PREVfRU5WIHRvIHByb2R1Y3Rpb25cclxuICBwbHVnaW5zOiBbXHJcbiAgICB2dWUoKSxcclxuICAgIFZpdGVJbWFnZW1pbih7XHJcbiAgICAgIG1vempwZWc6IHtcclxuICAgICAgICBxdWFsaXR5OiA3NSxcclxuICAgICAgfSxcclxuICAgICAgcG5ncXVhbnQ6IHtcclxuICAgICAgICBxdWFsaXR5OiBbMC42NSwgMC45XSxcclxuICAgICAgICBzcGVlZDogNCxcclxuICAgICAgfSxcclxuICAgICAgc3Znbzoge1xyXG4gICAgICAgIHBsdWdpbnM6IFt7IHJlbW92ZVZpZXdCb3g6IGZhbHNlIH1dLFxyXG4gICAgICB9LFxyXG4gICAgfSksXHJcbiAgXSxcclxuICBidWlsZDoge1xyXG4gICAgb3V0RGlyOiBcImRpc3QvcmVuZGVyZXJcIixcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgaW5wdXQ6IHtcclxuICAgICAgICBtYWluX3dpbmRvdzogXCJzcmMvcmVuZGVyZXIvbWFpbi5qc1wiLCAvLyBTcGVjaWZ5IHRoZSBlbnRyeSBwb2ludCBmb3IgeW91ciByZW5kZXJlclxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUVBLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sU0FBUztBQUNoQixPQUFPLGtCQUFrQjtBQUd6QixJQUFPLCtCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUE7QUFBQSxFQUNOLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxJQUNKLGFBQWE7QUFBQSxNQUNYLFNBQVM7QUFBQSxRQUNQLFNBQVM7QUFBQSxNQUNYO0FBQUEsTUFDQSxVQUFVO0FBQUEsUUFDUixTQUFTLENBQUMsTUFBTSxHQUFHO0FBQUEsUUFDbkIsT0FBTztBQUFBLE1BQ1Q7QUFBQSxNQUNBLE1BQU07QUFBQSxRQUNKLFNBQVMsQ0FBQyxFQUFFLGVBQWUsTUFBTSxDQUFDO0FBQUEsTUFDcEM7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDYixPQUFPO0FBQUEsUUFDTCxhQUFhO0FBQUE7QUFBQSxNQUNmO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
