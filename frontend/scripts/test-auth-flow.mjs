import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', ssr: { external: ['react', 'react-dom', 'react-dom/server'] } });
try {
  const tests = await server.ssrLoadModule('/tests/auth-flow.jsx');
  console.log(tests.verifyAuthScreens());
} finally { await server.close(); }
