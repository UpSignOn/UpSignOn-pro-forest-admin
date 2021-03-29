module.exports = {
  apps: [
    {
      name: "upsignon-pro-forest-admin-server",
      script: "./server.js",
      instances: 1,
      exec_model: "fork",
      error_file: "./logs/server-error.log",
      out_file: "./logs/server-output.log",
      combine_logs: true,
      kill_timeout: 3000,
      source_map_support: false,
    },
  ],
};
