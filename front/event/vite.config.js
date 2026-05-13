import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Em desenvolvimento, deixe VITE_API_BASE_URL vazio no .env para o browser
 * chamar apenas /events, /login etc. no mesmo origin do Vite — o proxy abaixo
 * encaminha para o backend e evita CORS.
 *
 * Para ASP.NET com HTTPS em localhost (cert. autoassinado), use
 * VITE_DEV_PROXY_TARGET=https://localhost:PORTA e secure: false (abaixo).
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget =
    env.VITE_DEV_PROXY_TARGET ?? 'http://localhost:5000';
  const proxyHttps = proxyTarget.startsWith('https:');

  const proxyOpts = {
    target: proxyTarget,
    changeOrigin: true,
    // Evita falha de TLS no proxy quando o Kestrel usa HTTPS + cert. dev
    ...(proxyHttps ? { secure: false } : {}),
  };

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/login': { ...proxyOpts },
        '/signup': { ...proxyOpts },
        '/events': { ...proxyOpts },
      },
    },
  };
});
