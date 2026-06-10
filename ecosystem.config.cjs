module.exports = {
  apps: [
    {
      name: "burro-students",
      cwd: "./apps/students",
      script: "pnpm",
      args: "preview --host 0.0.0.0 --port 3001",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "burro-parents",
      cwd: "./apps/parents",
      script: "pnpm",
      args: "preview --host 0.0.0.0 --port 3002",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "burro-adminpanel",
      cwd: "./apps/adminpanel",
      script: "pnpm",
      args: "preview --host 0.0.0.0 --port 3003",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "burro-backend",
      cwd: "./apps/backend",
      script: "dist/main.js",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
