import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
// Could import any other source file/function here
import worker from '../src';
import type { Env } from '../worker-configuration.d';

declare module 'cloudflare:test' {
  // ...or if you have an existing `Env` type...
  interface ProvidedEnv extends Env {}
}

describe('Hello World worker', () => {
  it('responds with Hello World!', async () => {
    const request = new Request('http://example.com');
    // Create an empty context to pass to `worker.fetch()`
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
    await waitOnExecutionContext(ctx);
    expect(await response.text()).toBe('Hello World!');
  });

  it('can websocket echo', async () => {
    const request = new Request('http://example.com', {
      headers: { upgrade: 'websocket' },
    });
    // Create an empty context to pass to `worker.fetch()`
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);

    const ws = response.webSocket!;
    // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
    // await waitOnExecutionContext(ctx);
    // expect(response.status).toBe(101);
    // const ws = new WebSocket(response.url);

    const message = 'Hello, WebSocket!';
    ws.send(message);
    await new Promise<void>((resolve) => {
      ws.addEventListener('message', (event) => {
        expect(event.data).toBe(message);
        ws.close();
        resolve();
      });
    });
  });
});
