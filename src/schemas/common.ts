import { z } from "zod";

export const CHRONOSEEK_PROTOCOL_VERSION = "2026-03-01" as const;

export const protocolVersionSchema = z.literal(CHRONOSEEK_PROTOCOL_VERSION);

export const nonEmptyStringSchema = z.string().trim().min(1);

export const urlSchema = z.string().url();

export const metadataSchema = z.record(z.string(), z.unknown());

export const searchStatusSchema = z.enum([
  "accepted",
  "processing",
  "completed",
  "failed",
]);

export const timestampSecondsSchema = z.number().finite().min(0);

export const confidenceSchema = z.number().finite().min(0).max(1);

export const intervalObjectSchema = z.object({
  start: timestampSecondsSchema,
  end: timestampSecondsSchema,
});

export const intervalSchema = intervalObjectSchema
  .refine((value) => value.end >= value.start, {
    message: "end must be greater than or equal to start",
    path: ["end"],
  });

export type ProtocolVersion = z.infer<typeof protocolVersionSchema>;
export type SearchStatus = z.infer<typeof searchStatusSchema>;
export type Interval = z.infer<typeof intervalSchema>;
