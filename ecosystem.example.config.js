const env = {
  FOREST_ENV_SECRET: "secret_given_by_forest",
  FOREST_AUTH_SECRET: "2ab25b921c4bf35bb43b1f5b7aaa04e27a3142ada836fcd2323ea148ad953145fd1cac1b1a2250fd33d13499345c",

  NODE_ENV: "production",

  APPLICATION_PORT: "3001",
  APPLICATION_URL: "https://forest-admin.mon-espace-pro.fr",

  DATABASE_URL: "postgres://db-administrator:db-password@localhost:5432/upsignonpro",
  DOCKER_DATABASE_URL: "postgres://db-administrator:db-password@host.docker.internal:5432/upsignonpro",

  EMAIL_HOST: "smtp.something.fr",
  EMAIL_PORT: "587",
  EMAIL_USER: "no-reply@domain.com",
  EMAIL_PASS: "email_password",
};

module.exports = {
  apps: [
    {
      name: "upsignon-pro-forest-admin-server",
      script: "./server.js",
      env,
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
