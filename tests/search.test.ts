import { describe, expect, it } from "vitest";
import {
  legacyCompatibleVideoSearchRequestSchema,
  protocolErrorSchema,
  videoSearchRequestSchema,
  videoSearchResponseSchema,
  videoSearchStreamAcceptedEventDataSchema,
  videoSearchStreamDoneEventDataSchema,
  videoSearchStreamErrorEventDataSchema,
  videoSearchStreamResultEventDataSchema,
} from "../src/index.js";

describe("videoSearchRequestSchema", () => {
  it("accepts a minimal valid request", () => {
    const parsed = videoSearchRequestSchema.parse({
      video: {
        url: "https://example.com/video.mp4",
      },
      query: "the moment the speaker writes on the whiteboard",
    });

    expect(parsed.top_k).toBe(5);
    expect(parsed.protocol_version).toBe("2026-04-10");
  });

  it("accepts the legacy video_url request shape and normalizes it", () => {
    const parsed = legacyCompatibleVideoSearchRequestSchema.parse({
      video_url: "https://example.com/video.mp4",
      query: "the moment the speaker writes on the whiteboard",
    });

    expect(parsed.video.url).toBe("https://example.com/video.mp4");
    expect(parsed.top_k).toBe(5);
  });
});

describe("protocol envelopes", () => {
  it("accepts a valid response envelope", () => {
    const parsed = videoSearchResponseSchema.parse({
      request_id: "req-123",
      status: "completed",
      results: [
        {
          start: 12.5,
          end: 20,
          confidence: 0.91,
        },
      ],
      miner_metadata: {
        source: "validator-gateway",
      },
    });

    expect(parsed.request_id).toBe("req-123");
  });

  it("accepts a valid protocol error envelope", () => {
    const parsed = protocolErrorSchema.parse({
      protocol_version: "2026-04-10",
      error: {
        code: "VIDEO_FETCH_FAILED",
        message: "The video URL could not be fetched.",
        details: {
          request_id: "req-123",
        },
      },
    });

    expect(parsed.error.code).toBe("VIDEO_FETCH_FAILED");
  });

  it("accepts valid streaming event payloads", () => {
    const accepted = videoSearchStreamAcceptedEventDataSchema.parse({
      protocol_version: "2026-04-10",
      request_id: "req-456",
      status: "accepted",
      queried_uids: [1, 3, 4],
    });
    const result = videoSearchStreamResultEventDataSchema.parse({
      protocol_version: "2026-04-10",
      request_id: "req-456",
      status: "processing",
      results: [
        {
          start: 12.5,
          end: 20,
          confidence: 0.91,
        },
      ],
      source_uid: 3,
    });
    const done = videoSearchStreamDoneEventDataSchema.parse({
      protocol_version: "2026-04-10",
      request_id: "req-456",
      status: "completed",
      results: [
        {
          start: 12.5,
          end: 20,
          confidence: 0.91,
        },
      ],
    });
    const error = videoSearchStreamErrorEventDataSchema.parse({
      protocol_version: "2026-04-10",
      request_id: "req-456",
      status: "failed",
      error: {
        code: "TIMEOUT",
        message: "All miner queries timed out.",
      },
    });

    expect(accepted.queried_uids).toEqual([1, 3, 4]);
    expect(result.source_uid).toBe(3);
    expect(done.status).toBe("completed");
    expect(error.error.code).toBe("TIMEOUT");
  });
});
