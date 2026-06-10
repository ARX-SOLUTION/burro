module.exports = {
  apps: [
    {
      name: 'burro-api',
      cwd: './apps/backend',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      max_memory_restart: '512M',
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      time: true
    },
    {
      name: 'burro-students-preview',
      cwd: './apps/students',
      script: 'pnpm',
      args: 'preview --host 127.0.0.1 --port 4173',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/students-error.log',
      out_file: './logs/students-out.log',
      time: true
    },
    {
      name: 'burro-parents-preview',
      cwd: './apps/parents',
      script: 'pnpm',
      args: 'preview --host 127.0.0.1 --port 4174',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/parents-error.log',
      out_file: './logs/parents-out.log',
      time: true
    },
    {
      name: 'burro-admin-preview',
      cwd: './apps/adminpanel',
      script: 'pnpm',
      args: 'preview --host 127.0.0.1 --port 4175',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/admin-error.log',
      out_file: './logs/admin-out.log',
      time: true
    }
  ]
};
