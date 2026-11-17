// Сървърът трябва да тръгва и на по-стар Node, който НЕ може да зарежда ES модули през require()
// (така беше на Railway: jwks-rsa@4 -> jose@6 е само ESM и целият сървър падаше при старт с 502).
// Затова зареждаме приложението в отделен процес с --no-experimental-require-module —
// ако някой пакет пак стане само ESM, тестът ще гръмне тук, а не в production.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

test('приложението се зарежда без require() на ES модули', () => {
    const root = path.resolve(__dirname, '..', '..');
    const result = spawnSync(
        process.execPath,
        ['--no-experimental-require-module', '-e', "global.__basedir = process.cwd(); require('./app')(); require('jwks-rsa');"],
        { cwd: root, env: { ...process.env, SECRET: 'x', COOKIESECRET: 'y' }, encoding: 'utf8' },
    );
    assert.equal(result.status, 0, `Приложението не се зареди:\n${result.stderr}`);
});
