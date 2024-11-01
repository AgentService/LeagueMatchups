module.exports = {
  packagerConfig: {
    asar: false, // or an object containing your asar options
    ignore: [
      /^\/public$/, // This regex will ignore the 'public' folder at the root of your project
      /^\/server$/, // This regex will ignore the 'server' folder at the root of your project
      /^\/test$/ // This regex will ignore the 'test' folder at the root of your project
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      platforms: ["win32"],
      config: {
        name: "league_matchups", // The name for your application installer
        // ... other configuration options specific to the Squirrel.Windows target ...
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-vite",
      config: {
        // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
        // If you are familiar with Vite configuration, it will look really familiar.
        build: [
          {
            // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
            entry: "src/main.js",
            config: "vite.main.config.mjs",
          },
          {
            entry: "src/preload.js",
            config: "vite.preload.config.mjs",
          },
        ],
        renderer: [
          {
            name: "main_window",
            config: "vite.renderer.config.mjs",
          },
        ],
      },
    },
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "AgentService",
          name: "LeagueMatchups",
        },
        authToken: process.env.GITHUB_TOKEN,
        prerelease: false,
        draft: true,
      },
    },
  ],
};
