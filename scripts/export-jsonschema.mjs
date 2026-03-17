import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const outDir = path.resolve("artifacts/jsonschema");

const nonEmptyStringSchema = {
  type: "string",
  minLength: 1,
};

const protocolVersionSchema = {
  type: "string",
  const: "2026-03-01",
};

const videoSearchRequestSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "VideoSearchRequest",
  type: "object",
  additionalProperties: false,
  required: ["protocol_version", "video", "query", "top_k"],
  properties: {
    protocol_version: protocolVersionSchema,
    request_id: {
      ...nonEmptyStringSchema,
    },
    video: {
      type: "object",
      additionalProperties: false,
      required: ["url"],
      properties: {
        url: {
          type: "string",
          format: "uri",
        },
      },
    },
    query: nonEmptyStringSchema,
    top_k: {
      type: "integer",
      minimum: 1,
      maximum: 20,
      default: 5,
    },
  },
};

const videoSearchResponseSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "VideoSearchResponse",
  type: "object",
  additionalProperties: false,
  required: ["protocol_version", "status", "results"],
  properties: {
    protocol_version: protocolVersionSchema,
    request_id: {
      ...nonEmptyStringSchema,
    },
    status: {
      type: "string",
      enum: ["accepted", "processing", "completed", "failed"],
    },
    results: {
      type: "array",
      default: [],
      items: {
        type: "object",
        additionalProperties: false,
        required: ["start", "end", "confidence"],
        properties: {
          start: {
            type: "number",
            minimum: 0,
          },
          end: {
            type: "number",
            minimum: 0,
          },
          confidence: {
            type: "number",
            minimum: 0,
            maximum: 1,
          },
        },
      },
    },
    miner_metadata: {
      type: "object",
      additionalProperties: true,
    },
  },
};

const protocolErrorSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "ProtocolError",
  type: "object",
  additionalProperties: false,
  required: ["protocol_version", "error"],
  properties: {
    protocol_version: protocolVersionSchema,
    error: {
      type: "object",
      additionalProperties: false,
      required: ["code", "message"],
      properties: {
        code: {
          type: "string",
          enum: [
            "INVALID_REQUEST",
            "UNSUPPORTED_PROTOCOL_VERSION",
            "VIDEO_FETCH_FAILED",
            "VIDEO_UNREADABLE",
            "QUERY_INVALID",
            "INFERENCE_FAILED",
            "TIMEOUT",
            "INTERNAL_ERROR",
          ],
        },
        message: nonEmptyStringSchema,
        details: {
          type: "object",
          additionalProperties: true,
        },
      },
    },
  },
};

async function writeSchema(filename, schema) {
  await writeFile(
    path.join(outDir, filename),
    `${JSON.stringify(schema, null, 2)}\n`,
    "utf8",
  );
}

async function main() {
  await mkdir(outDir, { recursive: true });
  await writeSchema(
    "video-search-request.schema.json",
    videoSearchRequestSchema,
  );
  await writeSchema(
    "video-search-response.schema.json",
    videoSearchResponseSchema,
  );
  await writeSchema("protocol-error.schema.json", protocolErrorSchema);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
