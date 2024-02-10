module.exports = {
  apps: [
    {
      name: "api",
      script: "./server.mjs",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        DEBUG:
          "server,-socket.io-client:*,app:*:*,app:store:*,api, api:*, utils:*",
      },
    },
  ],
};
