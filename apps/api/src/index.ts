import { createApp } from './app.js';
import { parseEnv } from './config/env.js';

// parseEnv melempar error kalau ada konfigurasi yang kurang, jadi proses
// berhenti di sini -- bukan jalan setengah lalu gagal di request pertama.
const env = parseEnv(process.env);
const app = createApp(env);

app.listen(env.PORT, () => {
  console.info(
    `[api] jalan di http://localhost:${String(env.PORT)} (${env.NODE_ENV})`,
  );
});
