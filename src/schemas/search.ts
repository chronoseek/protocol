import { z } from "zod";
import {
  CHRONOSEEK_PROTOCOL_VERSION,
  confidenceSchema,
  intervalObjectSchema,
  metadataSchema,
  nonEmptyStringSchema,
  protocolVersionSchema,
  searchStatusSchema,
  urlSchema,
} from "./common.js";

export const videoSourceSchema = z.object({
  url: urlSchema,
});

export const videoSearchRequestSchema = z.object({
  protocol_version: protocolVersionSchema.default(CHRONOSEEK_PROTOCOL_VERSION),
  request_id: nonEmptyStringSchema.optional(),
  video: videoSourceSchema,
  query: nonEmptyStringSchema,
  top_k: z.number().int().min(1).max(20).default(5),
});

export const legacyCompatibleVideoSearchRequestSchema = z
  .preprocess((value) => {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      "video_url" in value &&
      !("video" in value)
    ) {
      const payload = value as Record<string, unknown>;
      return {
        ...payload,
        video: {
          url: payload.video_url,
        },
      };
    }

    return value;
  }, videoSearchRequestSchema)
  .transform((value) => videoSearchRequestSchema.parse(value));

export const videoSearchResultSchema = intervalObjectSchema
  .extend({
    confidence: confidenceSchema,
  })
  .refine((value) => value.end >= value.start, {
    message: "end must be greater than or equal to start",
    path: ["end"],
  });

export const videoSearchResponseSchema = z.object({
  protocol_version: protocolVersionSchema.default(CHRONOSEEK_PROTOCOL_VERSION),
  request_id: nonEmptyStringSchema.optional(),
  status: searchStatusSchema,
  results: z.array(videoSearchResultSchema).default([]),
  miner_metadata: metadataSchema.optional(),
});

export type VideoSource = z.infer<typeof videoSourceSchema>;
export type VideoSearchRequest = z.infer<typeof videoSearchRequestSchema>;
export type VideoSearchResult = z.infer<typeof videoSearchResultSchema>;
export type VideoSearchResponse = z.infer<typeof videoSearchResponseSchema>;
