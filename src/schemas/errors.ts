import { z } from "zod";
import { nonEmptyStringSchema, protocolVersionSchema } from "./common.js";

export const protocolErrorCodeSchema = z.enum([
  "INVALID_REQUEST",
  "UNSUPPORTED_PROTOCOL_VERSION",
  "VIDEO_FETCH_FAILED",
  "VIDEO_UNREADABLE",
  "QUERY_INVALID",
  "INFERENCE_FAILED",
  "TIMEOUT",
  "INTERNAL_ERROR",
]);

export const protocolErrorSchema = z.object({
  protocol_version: protocolVersionSchema,
  error: z.object({
    code: protocolErrorCodeSchema,
    message: nonEmptyStringSchema,
    details: z.record(z.string(), z.unknown()).optional(),
  }),
});

export type ProtocolErrorCode = z.infer<typeof protocolErrorCodeSchema>;
export type ProtocolError = z.infer<typeof protocolErrorSchema>;
