import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const envProdPath = path.join(rootDir, '.env.production');

console.log('🚀 Iniciando compilación de producción...');

if (!fs.existsSync(envProdPath)) {
  console.error(`❌ Error: No se encontró el archivo de entorno en: ${envProdPath}`);
  process.exit(1);
}

// Leer y parsear .env.production
const rawEnv = fs.readFileSync(envProdPath, 'utf-8');
const envVars = {};

for (const line of rawEnv.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;

  const equalIndex = trimmed.indexOf('=');
  if (equalIndex === -1) continue;

  const key = trimmed.slice(0, equalIndex).trim();
  let value = trimmed.slice(equalIndex + 1).trim();

  // Eliminar comillas envolventes si las tiene
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  envVars[key] = value;
}

console.log('📦 Variables cargadas desde .env.production:');
for (const [k, v] of Object.entries(envVars)) {
  console.log(`   - ${k}=${v}`);
}

// Inyectar en process.env
const childEnv = {
  ...process.env,
  ...envVars,
};

console.log('\n⚙️  Ejecutando "astro build --mode production"...\n');

const isWindows = process.platform === 'win32';
const command = 'npx astro build --mode production';

const result = spawnSync(command, {
  cwd: rootDir,
  env: childEnv,
  stdio: 'inherit',
  shell: true,
});

if (result.error) {
  console.error('❌ Error al ejecutar astro build:', result.error);
  process.exit(1);
}

if (result.status !== 0) {
  console.error(`❌ La compilación falló con código de salida ${result.status}`);
  process.exit(result.status || 1);
}

console.log('\n✅ Compilación de producción finalizada exitosamente en ./dist');
