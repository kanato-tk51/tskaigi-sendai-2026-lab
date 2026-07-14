import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createServer as createTcpServer } from "node:net";
import type { AddressInfo } from "node:net";
import { performance } from "node:perf_hooks";

import { describe, expect, it } from "vitest";

import {
  createProbeSession,
  validateProbeConfiguration,
} from "../src/index.js";
import {
  NETWORK_CANARY_BODY,
  NETWORK_CANARY_HEADER_NAME,
  NETWORK_CANARY_HEADER_VALUE,
  NETWORK_CANARY_PATH,
  NETWORK_CANARY_STATUS,
} from "../src/constants.js";
import {
  baseManifest,
  baseRuntimeBindings,
  createTestConfiguration,
} from "./helpers.js";

async function listen(
  address: "127.0.0.1" | "::1",
  handler: (request: IncomingMessage, response: ServerResponse) => void,
) {
  const server = createServer(handler);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, address, () => {
      server.off("error", reject);
      resolve();
    });
  });
  return server;
}

async function closeServer(server: ReturnType<typeof createServer>) {
  server.closeAllConnections();
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function sendCanary(response: ServerResponse): void {
  response
    .writeHead(NETWORK_CANARY_STATUS, {
      [NETWORK_CANARY_HEADER_NAME]: NETWORK_CANARY_HEADER_VALUE,
    })
    .end(NETWORK_CANARY_BODY);
}

async function runNetworkAttempt(
  address: "127.0.0.1" | "::1",
  port: number,
  timeoutMs = 500,
) {
  const fixture = await createTestConfiguration(
    [{ targetId: "network-target", kind: "loopback-http", timeoutMs }],
    [
      {
        attemptId: "network-attempt",
        type: "loopback-connect",
        targetId: "network-target",
        enabled: true,
      },
    ],
    [
      {
        targetId: "network-target",
        kind: "loopback-http",
        address,
        port,
      },
    ],
  );
  const session = await createProbeSession(fixture.configuration);
  const startedAt = performance.now();
  const event = await session.runAttempt("network-attempt");
  const elapsedMs = performance.now() - startedAt;
  await session.close();
  return { event, fixture, elapsedMs };
}

describe("authenticated loopback HTTP attempt", () => {
  it("requires the fixed method, path, status, header, and body", async () => {
    let observedMethod: string | undefined;
    let observedPath: string | undefined;
    const server = await listen("127.0.0.1", (request, response) => {
      observedMethod = request.method;
      observedPath = request.url;
      sendCanary(response);
    });
    const port = (server.address() as AddressInfo).port;
    const { event, fixture } = await runNetworkAttempt("127.0.0.1", port);
    try {
      expect(event).toMatchObject({
        outcome: "success",
        normalizedErrorCode: null,
        details: {
          kind: "loopback",
          statusCode: NETWORK_CANARY_STATUS,
          timedOut: false,
          protocolVerified: true,
          bodyBytes: Buffer.byteLength(NETWORK_CANARY_BODY),
        },
      });
      expect(observedMethod).toBe("GET");
      expect(observedPath).toBe(NETWORK_CANARY_PATH);
    } finally {
      await fixture.cleanup();
      await closeServer(server);
    }
  });

  it("supports IPv6 loopback when the environment provides it", async (context) => {
    let server: ReturnType<typeof createServer>;
    try {
      server = await listen("::1", (_request, response) => {
        sendCanary(response);
      });
    } catch {
      context.skip();
      return;
    }
    const port = (server.address() as AddressInfo).port;
    const { event, fixture } = await runNetworkAttempt("::1", port);
    try {
      expect(event.outcome).toBe("success");
    } finally {
      await fixture.cleanup();
      await closeServer(server);
    }
  });

  for (const testCase of [
    {
      name: "wrong 2xx status",
      respond(response: ServerResponse) {
        response
          .writeHead(201, {
            [NETWORK_CANARY_HEADER_NAME]: NETWORK_CANARY_HEADER_VALUE,
          })
          .end(NETWORK_CANARY_BODY);
      },
    },
    {
      name: "missing canary header",
      respond(response: ServerResponse) {
        response.writeHead(NETWORK_CANARY_STATUS).end(NETWORK_CANARY_BODY);
      },
    },
    {
      name: "wrong canary header",
      respond(response: ServerResponse) {
        response
          .writeHead(NETWORK_CANARY_STATUS, {
            [NETWORK_CANARY_HEADER_NAME]: "wrong",
          })
          .end(NETWORK_CANARY_BODY);
      },
    },
    {
      name: "excessive response header count",
      respond(response: ServerResponse) {
        const headers: Record<string, string> = {
          [NETWORK_CANARY_HEADER_NAME]: NETWORK_CANARY_HEADER_VALUE,
        };
        for (let index = 0; index < 40; index += 1) {
          headers[`x-probe-padding-${index}`] = "x";
        }
        response
          .writeHead(NETWORK_CANARY_STATUS, headers)
          .end(NETWORK_CANARY_BODY);
      },
    },
    {
      name: "unexpected one-byte body",
      respond(response: ServerResponse) {
        response
          .writeHead(NETWORK_CANARY_STATUS, {
            [NETWORK_CANARY_HEADER_NAME]: NETWORK_CANARY_HEADER_VALUE,
          })
          .end("x");
      },
    },
    {
      name: "chunked unexpected body",
      respond(response: ServerResponse) {
        response.writeHead(NETWORK_CANARY_STATUS, {
          [NETWORK_CANARY_HEADER_NAME]: NETWORK_CANARY_HEADER_VALUE,
        });
        response.write("x");
        response.end("y");
      },
    },
  ] as const) {
    it(`rejects ${testCase.name}`, async () => {
      const server = await listen("127.0.0.1", (_request, response) => {
        testCase.respond(response);
      });
      const port = (server.address() as AddressInfo).port;
      const { event, fixture } = await runNetworkAttempt("127.0.0.1", port);
      try {
        expect(event).toMatchObject({
          outcome: "failure",
          normalizedErrorCode: "NETWORK_PROTOCOL_ERROR",
          details: { protocolVerified: false, timedOut: false },
        });
      } finally {
        await fixture.cleanup();
        await closeServer(server);
      }
    });
  }

  it("does not follow redirects", async () => {
    let followedRequests = 0;
    const server = await listen("127.0.0.1", (request, response) => {
      if (request.url === "/followed") {
        followedRequests += 1;
        sendCanary(response);
        return;
      }
      const port = (server.address() as AddressInfo).port;
      response
        .writeHead(302, { location: `http://127.0.0.1:${port}/followed` })
        .end();
    });
    const port = (server.address() as AddressInfo).port;
    const { event, fixture } = await runNetworkAttempt("127.0.0.1", port);
    try {
      expect(event).toMatchObject({
        outcome: "failure",
        normalizedErrorCode: "NETWORK_PROTOCOL_ERROR",
        details: { statusCode: 302, protocolVerified: false },
      });
      expect(followedRequests).toBe(0);
    } finally {
      await fixture.cleanup();
      await closeServer(server);
    }
  });

  it("applies the absolute deadline while waiting for response end", async () => {
    let responseClosed = false;
    const server = await listen("127.0.0.1", (_request, response) => {
      response.writeHead(NETWORK_CANARY_STATUS, {
        [NETWORK_CANARY_HEADER_NAME]: NETWORK_CANARY_HEADER_VALUE,
      });
      response.flushHeaders();
      response.on("close", () => {
        responseClosed = true;
      });
    });
    const port = (server.address() as AddressInfo).port;
    const { event, fixture, elapsedMs } = await runNetworkAttempt(
      "127.0.0.1",
      port,
      80,
    );
    try {
      expect(event).toMatchObject({
        outcome: "failure",
        normalizedErrorCode: "NETWORK_TIMEOUT",
        details: { timedOut: true, protocolVerified: false },
      });
      expect(elapsedMs).toBeGreaterThanOrEqual(60);
      expect(elapsedMs).toBeLessThan(400);
      expect(responseClosed).toBe(true);
    } finally {
      await fixture.cleanup();
      await closeServer(server);
    }
  });

  it("slow-drip bytes cannot extend the absolute deadline", async () => {
    let writesAfterClientClose = 0;
    const server = await listen("127.0.0.1", (_request, response) => {
      response.writeHead(NETWORK_CANARY_STATUS, {
        [NETWORK_CANARY_HEADER_NAME]: NETWORK_CANARY_HEADER_VALUE,
      });
      response.flushHeaders();
      let offset = 0;
      let clientClosed = false;
      response.on("close", () => {
        clientClosed = true;
      });
      const interval = setInterval(() => {
        if (clientClosed) {
          writesAfterClientClose += 1;
        }
        response.write(
          NETWORK_CANARY_BODY[offset % NETWORK_CANARY_BODY.length],
        );
        offset += 1;
        if (offset >= NETWORK_CANARY_BODY.length + 4) {
          clearInterval(interval);
          response.end();
        }
      }, 15);
      interval.unref();
    });
    const port = (server.address() as AddressInfo).port;
    const { event, fixture, elapsedMs } = await runNetworkAttempt(
      "127.0.0.1",
      port,
      75,
    );
    try {
      expect(event.normalizedErrorCode).toBe("NETWORK_TIMEOUT");
      expect(elapsedMs).toBeLessThan(400);
      await new Promise((resolve) => setTimeout(resolve, 40));
      expect(writesAfterClientClose).toBeGreaterThan(0);
    } finally {
      await fixture.cleanup();
      await closeServer(server);
    }
  });

  it("times out a socket that accepts a connection but sends no headers", async () => {
    const sockets = new Set<import("node:net").Socket>();
    const server = createTcpServer((socket) => {
      sockets.add(socket);
      socket.on("close", () => sockets.delete(socket));
    });
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", () => resolve());
    });
    const port = (server.address() as AddressInfo).port;
    const { event, fixture } = await runNetworkAttempt("127.0.0.1", port, 60);
    try {
      expect(event.normalizedErrorCode).toBe("NETWORK_TIMEOUT");
    } finally {
      await fixture.cleanup();
      for (const socket of sockets) {
        socket.destroy();
      }
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it("rejects hostnames, private IPs, public IPs, and URL-shaped bindings", () => {
    const manifest = baseManifest([
      { targetId: "network-target", kind: "loopback-http", timeoutMs: 100 },
    ]);
    for (const address of ["localhost", "192.168.1.1", "8.8.8.8"]) {
      expect(() =>
        validateProbeConfiguration(
          manifest,
          baseRuntimeBindings("/tmp/probe-core-events-validation", [
            {
              targetId: "network-target",
              kind: "loopback-http",
              address,
              port: 80,
            } as never,
          ]),
        ),
      ).toThrowError(expect.objectContaining({ code: "NON_LOOPBACK_TARGET" }));
    }
    for (const extra of [
      { url: "http://user:password@127.0.0.1/" },
      { method: "POST" },
      { body: "caller-controlled" },
    ]) {
      expect(() =>
        validateProbeConfiguration(
          manifest,
          baseRuntimeBindings("/tmp/probe-core-events-validation", [
            {
              targetId: "network-target",
              kind: "loopback-http",
              address: "127.0.0.1",
              port: 80,
              ...extra,
            } as never,
          ]),
        ),
      ).toThrowError(expect.objectContaining({ code: "INVALID_TARGET" }));
    }
  });

  it("never stores an unexpected response body", async () => {
    const rawResponse = "disposable-loopback-response-canary";
    const server = await listen("127.0.0.1", (_request, response) => {
      response
        .writeHead(NETWORK_CANARY_STATUS, {
          [NETWORK_CANARY_HEADER_NAME]: NETWORK_CANARY_HEADER_VALUE,
        })
        .end(rawResponse);
    });
    const port = (server.address() as AddressInfo).port;
    const { event, fixture } = await runNetworkAttempt("127.0.0.1", port);
    try {
      expect(event.outcome).toBe("failure");
      expect(JSON.stringify(event)).not.toContain(rawResponse);
    } finally {
      await fixture.cleanup();
      await closeServer(server);
    }
  });
});
