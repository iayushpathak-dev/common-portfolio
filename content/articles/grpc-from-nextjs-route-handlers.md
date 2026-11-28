## Introduction

Most of the FITPASS website talks to the backend over REST, but event tracking goes to a gRPC service. Browsers can't call gRPC services directly, so a Next.js Route Handler sits in between: the page sends JSON, the server calls the gRPC method.

The integration itself was straightforward. The surprise was in the build: the standalone output contained the **whole project**, source files and `.env` included. This article covers the gRPC setup and the one-line cause of that problem.

## Problem statement

- gRPC uses HTTP/2 framing and Protocol Buffers; browsers can't speak it without a gRPC-Web proxy.
- `@grpc/grpc-js` with `@grpc/proto-loader` reads `.proto` files **at runtime, by path**, instead of importing them.
- Next.js's `output: "standalone"` copies only the files it can trace from your code into `.next/standalone`. A path built at runtime is something it can't trace exactly.

## Learning objectives

1. Call a gRPC service from a Next.js Route Handler.
2. Load `.proto` files safely at runtime.
3. Understand how Next.js output file tracing works, and how a dynamic path can make it include far too much.
4. Ship `.proto` files with `outputFileTracingIncludes`.

## Core concepts

- **Route Handler**: a server-only HTTP endpoint in `app/api/.../route.js`. The `@grpc/grpc-js` package needs Node.js, so it runs in the Node runtime, not Edge.
- **`proto-loader`**: parses a `.proto` file into a package definition that `grpc-js` turns into a client class.
- **Output file tracing**: at build time, Next.js follows imports and static `fs` paths from each route to decide which files the standalone server needs.

## Technical explanation

### The request flow

```text
Page (client) → POST /api/grpc-service { service, params }
             → Route Handler: look up proto file, package, service and method by service key
             → grpc-js client → gRPC server (e.g. GeneralEvent.SendGeneralEvent)
```

The client sends only a **service key** and params. The proto path, package, service name and method come from a map on the server. If the browser could choose the proto file, it could make the server read any file it names.

### Why the build included everything

The helper originally built the proto path from whatever the caller passed in:

```js
const absoluteProtoPath = path.join(process.cwd(), protoUrl); // protoUrl comes from the caller
```

To be safe, Next.js's tracer has to assume a fully dynamic path under `process.cwd()` could point at **any** file in the project. So it traced the whole project into `.next/standalone`: source code, config and `.env`. Nothing fails when this happens, so it's easy to miss. The server runs normally; it just ships files it should never contain.

### The fix, in two parts

1. **Keep the lookup statically scoped.** Always join a fixed `"proto"` folder, and strip leading slashes, a `proto/` prefix and any `../` from the caller's value. The tracer now only sees paths under `./proto`, and traversal is blocked as a side effect.
2. **Tell Next.js to ship that folder** for this route with `outputFileTracingIncludes`, because runtime reads aren't imports and won't be picked up otherwise.

## Code example

```js
// lib/grpcClient.js
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

export function callGrpc({ protoFile, packageName, serviceName, methodName, payload, target, secure = false }) {
  return new Promise((resolve, reject) => {
    const rel = String(protoFile)
      .replace(/^[\\/]+/, "")
      .replace(/^proto[\\/]/, "")
      .replace(/\.\.[\\/]/g, "");
    const protoPath = path.join(process.cwd(), "proto", rel); // fixed folder: traceable

    const definition = protoLoader.loadSync(protoPath, {
      keepCase: true, longs: String, enums: String, defaults: true, oneofs: true,
    });
    const Service = grpc.loadPackageDefinition(definition)[packageName]?.[serviceName];
    if (!Service) return reject(new Error(`Service '${serviceName}' not found`));

    const client = new Service(target, secure ? grpc.credentials.createSsl() : grpc.credentials.createInsecure());
    if (typeof client[methodName] !== "function") return reject(new Error(`Method '${methodName}' not found`));

    client[methodName](payload, (err, res) => (err ? reject(err) : resolve(res)));
  });
}
```

```js
// next.config.js
module.exports = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/api/grpc-service": ["./proto/**/*"],
  },
};
```

How to check your own build:

```bash
next build
find .next/standalone -name ".env*" -o -name "*.proto" | head
```

If `.env` shows up, something is tracing too widely.

## Production considerations

- **Reuse clients.** Creating a client and parsing the proto on every request is slow. Cache the package definition and client per target at module level (they hold no user data, so sharing them across requests is fine).
- **Deadlines.** Pass a deadline (`{ deadline: Date.now() + 3000 }`) so a slow gRPC server can't hold your Route Handler open.
- **TLS between services.** `createInsecure()` is only acceptable inside a private network; use `createSsl()` otherwise.
- **Tracking must not block the user.** Fire-and-forget from the client, and respond quickly from the handler.

## Trade-offs and alternatives

- **gRPC-Web with Envoy** lets the browser call gRPC (almost) directly, but adds a proxy to run, and you still need server-side validation.
- **Generated static clients** (`protoc` with a JS/TS plugin) are imported like normal modules, so tracing just works and you get types; you need a code generation step.
- **A REST endpoint on the backend** for events is simpler if you control the backend.

## Common mistakes

- Letting the client choose the proto file or method name.
- Building file paths from `process.cwd()` plus a fully dynamic value in code that runs in a standalone build.
- Never checking what's inside `.next/standalone` or the Docker image.
- Creating a new gRPC client for every request.

## Key takeaways

- Browsers talk JSON to a Route Handler; the Route Handler talks gRPC.
- A fully dynamic `fs` path can make Next.js trace the entire project, secrets included.
- Keep runtime paths under a fixed folder and list that folder in `outputFileTracingIncludes`.
- Inspect your build output, not just whether it runs.
