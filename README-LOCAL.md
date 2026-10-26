# WebAudit — Local Deployment Guide

Run the full WebAudit automated auditing pipeline on your local workstation with one command.

## Prerequisites

- **Docker 24+** with Compose v2 (BuildKit is required and enabled by default)
- **RAM**: ~8 GB free RAM recommended
- **Disk**: ~10 GB free disk space for container images and local Maven dependencies

## Quick Start

```bash
cp .env.local.example .env
docker compose up --build
```

The first build resolves Maven dependencies and compiles the shared core library plus 13 services; expect 10–20 minutes on first run. Subsequent runs leverage the BuildKit cache mount (`id=webaudit-m2`) and start in seconds.

Once all containers report healthy:

| Service | URL | Notes |
|---|---|---|
| WebAudit UI (React 18) | http://localhost:4200 | Local web dashboard (Auth0 bypassed) |
| CrawlerAPI | http://localhost:9080 | REST API; `/actuator/health` returns `{"status":"UP"}` |
| Neo4j Browser | http://localhost:7474 | Cypher console; credentials: `neo4j` / `change-me` |
| Pub/Sub Emulator | http://localhost:8085 | REST endpoint for Google Cloud Pub/Sub emulator |

The remaining 11 backend worker services communicate internally across the Docker network (`webaudit-net`) via Pub/Sub topics and Neo4j graph storage.

---

### Security Note

The local stack ships with a development Neo4j password (`change-me`), an anonymous-principal Spring profile that bypasses Auth0, and a permissive CORS policy. These defaults are designed strictly for loopback local testing (`localhost` / `127.0.0.1`).

> [!WARNING]
> Rotate `NEO4J_PASSWORD` in `.env` before exposing any port to non-loopback interfaces. Never activate `SPRING_PROFILES_ACTIVE=local` in internet-facing environments.

---

## Architecture of the Local Stack

```
docker compose up --build
├── neo4j                    (Neo4j 5.20 Community Edition graph database)
├── neo4j-bootstrap          (Applies schema indexes and uniqueness constraints)
├── pubsub-emulator          (Google Cloud Pub/Sub emulator: port 8085)
├── pubsub-bootstrap         (Initializes topics and push subscriptions)
├── crawlerapi               (Public REST API: Java 21 / Spring Boot 3, port 9080)
├── pagebuilder              (Headless Chrome / Selenium DOM extraction worker)
├── auditmanager             (Page audit lifecycle and worker orchestrator)
├── contentaudit             (Alt text, readability, and paragraph analysis)
├── visualdesignaudit        (Color contrast AA/AAA, typography, and spacing)
├── informationarchitectureaudit (Headings, semantic structure, forms, tables, links)
├── journeyexecutor          (Selenium headless browser journey runner)
├── journeyexpander          (Interactive element discovery & state expander)
├── auditservice             (Audit progress aggregator)
├── elementenrichment        (Visual and semantic element metadata enrichment)
├── journeymapcleanup        (Stale candidate journey cleaner)
├── journeyerrors            (Dead-letter queue / journey failure handler)
├── broadcaster              (Real-time event broadcaster)
└── ui                       (React 18 / Vite dashboard, port 4200)
```

---

## Authentication Configuration

In local mode, `CrawlerAPI` activates `LocalSecurityConfig`, bypassing Auth0 authentication so you can test immediately without credentials.

To connect a real Auth0 tenant instead:

1. In `.env`, clear the local profile:
   ```env
   SPRING_PROFILES_ACTIVE=
   AUTH0_DOMAIN=your-tenant.us.auth0.com
   AUTH0_CLIENT_ID=...
   AUTH0_AUDIENCE=https://api.your-domain.com
   ```
2. Rebuild CrawlerAPI and UI:
   ```bash
   docker compose up -d --no-deps --build crawlerapi ui
   ```

---

## Verifying the Stack

```bash
# Check container status
docker compose ps

# Verify CrawlerAPI health check
curl -s http://localhost:9080/actuator/health
# Expected: {"status":"UP"}

# Verify Pub/Sub topics in emulator
curl -s http://localhost:8085/v1/projects/webaudit-local/topics

# Inspect Neo4j indexes
docker compose exec neo4j cypher-shell -u neo4j -p change-me 'SHOW INDEXES'

# Access the UI
open http://localhost:4200
```

---

## Common Operations

```bash
# View real-time logs for a specific service
docker compose logs -f crawlerapi

# Rebuild a single service after making code changes
docker compose up -d --no-deps --build crawlerapi

# Reset all persistent state (drops Neo4j database and emulator topics)
docker compose down -v

# Open a shell inside a container
docker compose exec crawlerapi sh
```

---

## Local Development Notes

- **Shared Core Library**: WebAudit Core (`WebAuditCore`) is built once inside the shared BuildKit cache mount (`id=webaudit-m2`). Subsequent services reuse the cached `.m2` repository artifacts.
- **Pub/Sub Routing**: Spring Cloud GCP connects automatically to `PUBSUB_EMULATOR_HOST=pubsub-emulator:8085`. No Google Cloud credentials or cloud project are required locally.
- **Selenium Chrome**: Headless browser automation runs inside the `selenium-chrome` container (`standalone-chrome:125.0`) exposed at `http://selenium-chrome:4444/wd/hub`.
- **Health Checks**: Containers use Spring Boot Actuator (`/actuator/health`). Compose waits for `crawlerapi` to be healthy before bringing up the UI.

### Known Local Environment Limitations
- **Pusher Broadcast**: Real-time push updates are no-op when Pusher credentials are blank in `.env`. The UI remains fully functional via direct REST polling.
- **Third-Party Integrations**: Stripe, Segment, and GCP Cloud Vision/NLP APIs are disabled locally unless valid credentials are supplied.
