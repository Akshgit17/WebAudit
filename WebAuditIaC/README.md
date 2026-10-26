# WebAudit Infrastructure & Database Schema

Infrastructure and schema resources for the WebAudit accessibility audit platform.

## Overview

WebAudit runs in a fully reproducible, self-contained local development environment powered by Docker Compose. Live cloud deployment and provisioning files (previously under `WebAuditIaC/GCP`) have been removed to eliminate cloud account requirements, prevent credential exposure, and streamline local usage.

## Database Schema & Constraints

The Neo4j graph database schema, constraints, and indexes are defined in:
- `create-indexes-and-constraints.cql` (also linked into `scripts/local/create-indexes-and-constraints.cql` for Docker Compose bootstrap)

### Key Indexes & Constraints:
- **Account**: Unique constraint on `user_id`.
- **Domain**: Unique constraint on `url`.
- **Page**: Unique constraint on `url`.
- **AuditRecord**: Unique constraints and lookups on audit identifiers.
- **ElementState**: Lookups by xpath and CSS selectors.

## Local Runtime

For local development and testing:
1. Docker Compose provisions Neo4j 5.20 Community, Google Cloud Pub/Sub Emulator, Selenium Standalone Chrome, and the WebAudit microservices.
2. The `neo4j-bootstrap` service automatically runs `scripts/local/neo4j-bootstrap.sh`, which compiles and applies the CQL schema definitions and seeds the local development account (`local-dev-user`).
3. See [README-LOCAL.md](../README-LOCAL.md) for full instructions on running the application locally.

