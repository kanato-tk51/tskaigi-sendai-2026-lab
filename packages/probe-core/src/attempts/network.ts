import { request } from "node:http";
import type { ClientRequest, IncomingMessage } from "node:http";
import { performance } from "node:perf_hooks";

import {
  MAX_NETWORK_RESPONSE_BYTES,
  MAX_NETWORK_RESPONSE_HEADER_BYTES,
  NETWORK_CANARY_BODY,
  NETWORK_CANARY_HEADER_NAME,
  NETWORK_CANARY_HEADER_VALUE,
  NETWORK_CANARY_METHOD,
  NETWORK_CANARY_PATH,
  NETWORK_CANARY_STATUS,
} from "../constants.js";
import type { LoopbackHttpTarget, LoopbackRuntimeBinding } from "../types.js";
import type { AttemptExecutionResult } from "./types.js";

const MAX_NETWORK_RESPONSE_HEADERS = 32;

export function executeLoopbackAttempt(
  target: LoopbackHttpTarget,
  binding: LoopbackRuntimeBinding,
): Promise<AttemptExecutionResult> {
  return new Promise((resolve) => {
    const deadline = performance.now() + target.timeoutMs;
    let clientRequest: ClientRequest | undefined;
    let response: IncomingMessage | undefined;
    let deadlineTimer: ReturnType<typeof setTimeout> | undefined;
    let completed = false;
    let responseBytes = 0;
    const responseChunks: Buffer[] = [];
    let statusCode: number | null = null;
    let timedOut = false;

    const destroyTransport = (): void => {
      response?.destroy();
      clientRequest?.destroy();
    };

    const finish = (
      outcome: "success" | "failure",
      normalizedErrorCode: AttemptExecutionResult["normalizedErrorCode"],
      protocolVerified = false,
    ): void => {
      if (completed) {
        return;
      }
      completed = true;
      if (deadlineTimer !== undefined) {
        clearTimeout(deadlineTimer);
      }
      if (outcome === "failure") {
        destroyTransport();
      }
      resolve({
        outcome,
        normalizedErrorCode,
        beforeHash: null,
        afterHash: null,
        details: {
          kind: "loopback",
          statusCode,
          timedOut,
          protocolVerified,
          bodyBytes: responseBytes,
        },
      });
    };

    const scheduleDeadline = (): void => {
      const remaining = deadline - performance.now();
      if (remaining <= 0) {
        timedOut = true;
        finish("failure", "NETWORK_TIMEOUT");
        return;
      }
      deadlineTimer = setTimeout(scheduleDeadline, Math.max(1, remaining));
    };

    try {
      clientRequest = request(
        {
          host: binding.address,
          family: binding.address === "::1" ? 6 : 4,
          port: binding.port,
          method: NETWORK_CANARY_METHOD,
          path: NETWORK_CANARY_PATH,
          headers: { connection: "close" },
          agent: false,
          maxHeaderSize: MAX_NETWORK_RESPONSE_HEADER_BYTES,
        },
        (incomingResponse) => {
          if (completed) {
            incomingResponse.destroy();
            return;
          }
          response = incomingResponse;
          statusCode = response.statusCode ?? null;
          const headerValue = response.headers[NETWORK_CANARY_HEADER_NAME];
          const headerCount = response.rawHeaders.length / 2;
          const initialProtocolMatch =
            statusCode === NETWORK_CANARY_STATUS &&
            headerValue === NETWORK_CANARY_HEADER_VALUE &&
            Number.isInteger(headerCount) &&
            headerCount <= MAX_NETWORK_RESPONSE_HEADERS;

          if (!initialProtocolMatch) {
            finish("failure", "NETWORK_PROTOCOL_ERROR");
            return;
          }

          response.on("data", (chunk: Buffer | string) => {
            const buffer = Buffer.isBuffer(chunk)
              ? Buffer.from(chunk)
              : Buffer.from(chunk);
            responseBytes += buffer.byteLength;
            if (
              responseBytes > Buffer.byteLength(NETWORK_CANARY_BODY) ||
              responseBytes > MAX_NETWORK_RESPONSE_BYTES
            ) {
              finish(
                "failure",
                responseBytes > MAX_NETWORK_RESPONSE_BYTES
                  ? "NETWORK_RESPONSE_TOO_LARGE"
                  : "NETWORK_PROTOCOL_ERROR",
              );
              return;
            }
            responseChunks.push(buffer);
          });
          response.on("end", () => {
            if (completed) {
              return;
            }
            const protocolVerified =
              statusCode === NETWORK_CANARY_STATUS &&
              headerValue === NETWORK_CANARY_HEADER_VALUE &&
              responseBytes === Buffer.byteLength(NETWORK_CANARY_BODY) &&
              Buffer.concat(responseChunks).equals(
                Buffer.from(NETWORK_CANARY_BODY, "utf8"),
              );
            finish(
              protocolVerified ? "success" : "failure",
              protocolVerified ? null : "NETWORK_PROTOCOL_ERROR",
              protocolVerified,
            );
          });
          response.on("aborted", () => {
            finish("failure", timedOut ? "NETWORK_TIMEOUT" : "NETWORK_FAILURE");
          });
          response.on("error", () => {
            finish("failure", timedOut ? "NETWORK_TIMEOUT" : "NETWORK_FAILURE");
          });
        },
      );
      clientRequest.maxHeadersCount = MAX_NETWORK_RESPONSE_HEADERS;
      clientRequest.on("socket", (socket) => {
        if (completed) {
          socket.destroy();
        }
      });
      clientRequest.on("error", () => {
        finish("failure", timedOut ? "NETWORK_TIMEOUT" : "NETWORK_FAILURE");
      });
      scheduleDeadline();
      if (!completed) {
        clientRequest.end();
      }
    } catch {
      finish("failure", "NETWORK_FAILURE");
    }
  });
}
