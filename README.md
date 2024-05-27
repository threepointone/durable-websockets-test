## Writing tests with Durable Objects

I made a sample project with `npm create cloudflare` picking `"Hello World" Durable Object` template. Then I followed the steps at https://developers.cloudflare.com/workers/testing/vitest-integration/get-started/write-your-first-test/ to write a test.

Running npm test gives me the following error:

```
TypeError: The receiving Durable Object does not support RPC, because its class was not declared with `extends DurableObject`. In order to enable RPC, make sure your class extends the special class `DurableObject`, which can be imported from the module "cloudflare:workers".
```

This seems odd, because I have indeed extended DurableObject in my class.
