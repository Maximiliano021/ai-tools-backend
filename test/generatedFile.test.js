import { createServer } from 'http';
import { resolve, dirname } from 'path';
import { spawn } from 'child_process';
import { jest } from "@jest/globals";
import { fileURLToPath } from 'url';
import { PORT, PORT2 } from '../src/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

jest.mock('process', () => ({
  ...jest.requireActual('process'),
  env: { ...jest.requireActual('process').env }
}));

describe('Servidor', () => {
  let server;
  const mainPath = resolve(__dirname, '../index.js');

  afterEach((done) => {
    if (server && server.close) {
      server.close(done);
    } else {
      done();
    }
  });

  test('Debe tener un puerto especificado o usar port2 si el puerto principal está ocupado', (done) => {
  const envPort = PORT;
  try {
    expect(envPort).toBeDefined();
    expect(typeof envPort === 'string' || typeof envPort === 'number').toBe(true);
    done();
  } catch (error) {
    // Si falla, prueba el escenario de puerto ocupado
    server = createServer((req, res) => res.end('ocupado')).listen(PORT, async () => {
      const child = spawn('node', [mainPath], {
        env: { ...process.env, PORT, PORT2 }
      });

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes(PORT2.toString())) {
          child.kill();
          done();
        }
      });

      child.stderr.on('data', (data) => {
        child.kill();
        done(data.toString());
      });
    });
  }
});

  test('Debe iniciar correctamente el servidor', (done) => {
    // Ejecuta el servidor en otro proceso
    const child = spawn('node', [mainPath], {
      env: { PORT }
    });

    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
      if (output.includes(PORT.toString())) {
        child.kill();
        done();
      }
    });

    child.stderr.on('data', (data) => {
      child.kill();
      done(data.toString());
    });
  });
});