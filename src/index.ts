// import { DurableObject } from 'cloudflare:workers';
import type { Env } from '../worker-configuration.d';

/** A Durable Object's behavior is defined in an exported Javascript class */
export class MyDurableObject {
  /**
   * The constructor is invoked once upon creation of the Durable Object, i.e. the first call to
   * 	`DurableObjectStub::get` for a given identifier (no-op constructors can be omitted)
   *
   * @param ctx - The interface for interacting with Durable Object state
   * @param env - The interface to reference bindings declared in wrangler.toml
   */
  constructor(public controller: DurableObjectState, public env: Env) {}

  fetch(req: Request) {
    // if websocket
    if (req.headers.get('Upgrade') === 'websocket') {
      const { 0: client, 1: server } = new WebSocketPair();
      server.accept();
      server.addEventListener('message', (event) => {
        // echo
        client.send(event.data);
      });
      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    return new Response('Hello World!');
  }
}

export default {
  /**
   * This is the standard fetch handler for a Cloudflare Worker
   *
   * @param request - The request submitted to the Worker from the client
   * @param env - The interface to reference bindings declared in wrangler.toml
   * @param ctx - The execution context of the Worker
   * @returns The response to be sent back to the client
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // We will create a `DurableObjectId` using the pathname from the Worker request
    // This id refers to a unique instance of our 'MyDurableObject' class above
    const id: DurableObjectId = env.MY_DURABLE_OBJECT.idFromName(new URL(request.url).pathname);

    // This stub creates a communication channel with the Durable Object instance
    // The Durable Object constructor will be invoked upon the first call for a given id
    const stub = env.MY_DURABLE_OBJECT.get(id);

    // We call the `sayHello()` RPC method on the stub to invoke the method on the remote
    // Durable Object instance
    const response = await stub.fetch('http://example.com');

    const text = await response.text();

    return new Response(text);
  },
};
