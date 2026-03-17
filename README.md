# ChronoSeek Protocol

Public shared protocol package for ChronoSeek.

This package contains transport-safe schemas and types shared by:

- `chronoseek/bittensor-subnet`
- `chronoseek/platform`

It intentionally excludes product-specific concerns such as auth, billing, credits, API keys, and database models.

## Scope

- video search request/response schemas
- protocol error envelopes
- protocol versioning
- JSON Schema artifacts for Python and other non-TS consumers

## Exports

- `CHRONOSEEK_PROTOCOL_VERSION`
- `videoSearchRequestSchema`
- `videoSearchResultSchema`
- `videoSearchResponseSchema`
- `protocolErrorSchema`

## Non-Goals

This package must not contain:

- auth models
- user or workspace models
- credits or billing types
- top-up provider payloads
- internal database records

## Build

```bash
npm install
npm run build
npm run export:jsonschema
```
