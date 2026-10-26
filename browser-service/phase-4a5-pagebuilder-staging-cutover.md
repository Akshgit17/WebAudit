# Phase 4a.5 — PageBuilder Staging Cutover

> **Goal:** Run PageBuilder in staging with `WebAudit.browsing.mode=remote` against `browser-service-staging`, watch the `CapturePageSmokeCheck` watchdog and `browser_service_calls` facade metrics for 48 hours, and confirm the consumer survives a real browser-service round-trip end-to-end. No prod change in this phase.
>
> **Scope:** PageBuilder consumer config + WebAuditIaC Cloud Run env vars for the staging environment only. No WebAuditCore code changes; no call-site refactors (4a.2 already shipped); no prod flip (that's 4a.6).
>
> **Sibling references:** [`phase-4-consumer-cutover.md`](./phase-4-consumer-cutover.md) §4a.5 is the umbrella spec; this doc is the executable expansion. [`phase-4a4-smoke-check-bean.md`](./phase-4a4-smoke-check-bean.md) shipped the bean we're about to enable; this is the consumer-side counterpart.

## Why this phase exists now

WebAuditCore 0.8.2 (merged) gives PageBuilder three things needed for a safe cutover:

1. **Facade-level Micrometer instrumentation** (4a.1) — `browser_service_calls{operation,outcome}` counters and timers on every `BrowsingClient` call.
2. **Env-var plumbing** (4a.3) — `WebAudit_BROWSING_MODE`, `WebAudit_BROWSING_SERVICE_URL`, `WebAudit_BROWSING_CONNECT_TIMEOUT`, `WebAudit_BROWSING_READ_TIMEOUT` are already wired into `PageBuilder/src/main/resources/application.yml`.
3. **`CapturePageSmokeCheck` watchdog bean** (4a.4) — opt-in periodic `capturePage` probe emitting `browser_service_smoke_checks{outcome}`. Currently disabled because PageBuilder hasn't wired the `WebAudit.browsing.smoke-check.*` properties.

Phase 4a.5 closes the loop on the staging side: enable the smoke-check, flip the mode, observe.

## Scope

| In scope | Out of scope |
|---|---|
| PageBuilder `application.yml`: bind `WebAudit.browsing.smoke-check.{enabled,interval,target-url,browser}` to env vars | Adding new metrics or instrumentation beyond what 4a.1/4a.4 already emit |
| PageBuilder Dockerfile / CI workflow: nothing — env vars are runtime, not build-time | Element-state code paths (still phase-3b/4b territory) |
| WebAuditIaC `page_builder_cloud_run` module: add `WebAudit_BROWSING_*` env vars, gated on a `var.WebAudit_browsing_mode` knob defaulting to `"local"` so non-staging environments are unchanged | WebAuditIaC prod tfvars flip (that's 4a.6) |
| Staging tfvars: set `WebAudit_browsing_mode=remote`, `WebAudit_browsing_service_url=https://browser-service-staging.internal/v1`, `WebAudit_browsing_smoke_check_enabled=true` | Cost-alert configuration (already-armed prereq from 4a.6 §14.8 in the umbrella doc) |
| 48-hour burn-in observation procedure with explicit pass/fail thresholds | Dashboard authoring — assumed already in place from 4a.4's dashboard half |
| Rollback playbook (one-knob revert: `WebAudit_browsing_mode=local`) | Browser-service deployment to staging — owned upstream in `brandonkindred/browser-service` |

## Locked decisions

| Area | Decision |
|---|---|
| Mode knob | A new Terraform variable `WebAudit_browsing_mode` (string, default `"local"`) controls *all* consumers' mode in one place. Single-source-of-truth means a 4a-rollback or 4b/4c rollout is one variable change, not a coordinated edit across modules. |
| Smoke-check enable | Per-consumer Terraform variable `WebAudit_browsing_smoke_check_enabled` (bool, default `false`) — opt-in stays consistent with the WebAuditCore default. Each consumer's flip is observed independently. |
| Smoke-check target URL | `https://example.com` is fine for staging burn-in. Picking a WebAudit-owned URL is unnecessary noise — the goal is to validate the `BrowsingClient ↔ browser-service` round-trip, not to test against any specific page. |
| Smoke-check interval | 60s (the WebAuditCore default). Operators can override via tfvar if the dashboard wants higher resolution during the burn-in window. |
| Smoke-check browser | `CHROME` (the WebAuditCore default). PageBuilder's prod traffic is overwhelmingly Chrome; matching the dominant code path is the right signal. |
| Burn-in window | 48 hours per the umbrella doc §4a.5. Restart on any rollback. |

## Authoritative design reference

[`browser-service/phase-4-consumer-cutover.md`](./phase-4-consumer-cutover.md) §4a.5 — umbrella requirements (env vars, burn-in, rollback playbook).

## Prerequisites — confirmed GO

- [x] WebAuditCore 0.8.2 on `main` (PR #58 merged).
- [x] PageBuilder pinned to WebAuditCore 0.8.2 (`PageBuilder/pom.xml` line 16: `<webaudit-core.version>0.8.2</webaudit-core.version>`).
- [x] PageBuilder `application.yml` already binds `WebAudit_BROWSING_{MODE,SERVICE_URL,CONNECT_TIMEOUT,READ_TIMEOUT}` (from 4a.3).
- [x] `CapturePageSmokeCheck` bean exists, gated on `WebAudit.browsing.smoke-check.enabled=true` AND `WebAudit.browsing.mode=remote` AND `BrowserService` bean availability.
- [ ] **External:** browser-service deployed to staging with reachable URL `https://browser-service-staging.internal/v1`. (Owned upstream; this plan assumes it's GO before merge.)
- [ ] **External:** dashboard renders `browser_service_calls` and `browser_service_smoke_checks` metrics tagged with `consumer=page-builder`. (4a.4 dashboard half — assumed shipped via the infra repo.)

If either external prereq is not GO, this PR can still merge — the tfvar flip step (Step 3) is what actually exercises browser-service. Steps 1 and 2 are inert until the tfvar is set.

## Execution plan — 3 commits across 2 repos

### Commit 1 (PageBuilder) — `feat(config): wire smoke-check env vars`

Edit `PageBuilder/src/main/resources/application.yml`:

```yaml
WebAudit:
  browsing:
    mode: ${WebAudit_BROWSING_MODE:local}
    service-url: ${WebAudit_BROWSING_SERVICE_URL:}
    connect-timeout: ${WebAudit_BROWSING_CONNECT_TIMEOUT:5s}
    read-timeout: ${WebAudit_BROWSING_READ_TIMEOUT:120s}
    smoke-check:
      enabled: ${WebAudit_BROWSING_SMOKE_CHECK_ENABLED:false}
      interval: ${WebAudit_BROWSING_SMOKE_CHECK_INTERVAL:60s}
      target-url: ${WebAudit_BROWSING_SMOKE_CHECK_TARGET_URL:https://example.com}
      browser: ${WebAudit_BROWSING_SMOKE_CHECK_BROWSER:CHROME}
```

Defaults match WebAuditCore's `WebAuditBrowsingProperties.SmokeCheck` defaults so unset env vars produce identical behavior to today (smoke-check off).

No Spring-bean wiring needed — `CapturePageSmokeCheck` is already registered by `webaudit-core` autoconfiguration via `@Configuration` + `@ConditionalOnProperty`. The only thing missing was the property binding.

PR title: **"feat(config): wire smoke-check env vars for phase-4a.5 staging cutover"**. Body links to this plan doc.

### Commit 2 (WebAuditIaC) — `feat(page-builder): add WebAudit browsing env vars`

> **Note:** the `modules/cloud_run` module's existing `environment_variables` parameter is `map(list(string))` and renders every entry through `value_from.secret_key_ref` — i.e. it's for Secret Manager references only. Plain key/value env vars need a separate path. The implementation introduces a new `plain_environment_variables = map(string)` parameter on the module (with a corresponding `dynamic "env"` block in `main.tf`) and routes the `WebAudit_BROWSING_*` vars through it. The existing `environment_variables` block is left untouched.

Edit `WebAuditIaC/GCP/modules/cloud_run/variables.tf` — add the new parameter:

```hcl
variable "plain_environment_variables" {
  description = "Map of plain (non-secret) environment variables. Use environment_variables for secret references."
  type        = map(string)
  default     = {}
}
```

Edit `WebAuditIaC/GCP/modules/cloud_run/main.tf` — render the new map alongside the existing secret block:

```hcl
# Plain (non-secret) environment variables
dynamic "env" {
  for_each = var.plain_environment_variables
  content {
    name  = env.key
    value = env.value
  }
}
```

Edit `WebAuditIaC/GCP/modules.tf` (`module "page_builder_cloud_run"`) — add a sibling `plain_environment_variables` argument; **leave `environment_variables` unchanged**:

```hcl
plain_environment_variables = {
  "WebAudit_BROWSING_MODE"                   = var.WebAudit_browsing_mode
  "WebAudit_BROWSING_SERVICE_URL"            = var.WebAudit_browsing_service_url
  "WebAudit_BROWSING_SMOKE_CHECK_ENABLED"    = tostring(var.page_builder_smoke_check_enabled)
  "WebAudit_BROWSING_SMOKE_CHECK_INTERVAL"   = var.WebAudit_browsing_smoke_check_interval
  "WebAudit_BROWSING_SMOKE_CHECK_TARGET_URL" = var.WebAudit_browsing_smoke_check_target_url
}
```

Edit `WebAuditIaC/GCP/variables.tf` — add (defaults preserve current behavior):

```hcl
variable "WebAudit_browsing_mode" {
  type        = string
  description = "WebAudit.browsing.mode for all browser-using consumers. 'local' = in-process Selenium (current); 'remote' = route through browser-service."
  default     = "local"
  validation {
    condition     = contains(["local", "remote"], var.WebAudit_browsing_mode)
    error_message = "WebAudit_browsing_mode must be 'local' or 'remote'."
  }
}

variable "WebAudit_browsing_service_url" {
  type        = string
  description = "Endpoint for browser-service when WebAudit_browsing_mode = 'remote'. Empty when mode = 'local'."
  default     = ""
}

variable "page_builder_smoke_check_enabled" {
  type        = bool
  description = "Enables the CapturePageSmokeCheck watchdog in PageBuilder. Per-consumer to allow staged rollout."
  default     = false
}

variable "WebAudit_browsing_smoke_check_interval" {
  type        = string
  description = "Smoke-check probe interval (Spring Duration string)."
  default     = "60s"
}

variable "WebAudit_browsing_smoke_check_target_url" {
  type        = string
  description = "Smoke-check target URL. Anything reachable suffices; the metric measures the BrowsingClient round-trip, not the page."
  default     = "https://example.com"
}
```

Why one shared `WebAudit_browsing_mode` for all consumers but per-consumer `*_smoke_check_enabled`: the **mode** is the irreversible-feeling user-visible flip (and the rollback knob); having it as a single variable means a rollback is one edit, not three. The **smoke-check** is staged-on per consumer because each consumer's burn-in is observed independently.

PR title: **"feat(page-builder): add WebAudit browsing + smoke-check env vars (phase-4a.5)"**. Body links to this plan doc.

### Commit 3 (WebAuditIaC, **staging tfvars only**) — `chore(staging): flip page-builder to remote browsing`

Edit whatever `staging.tfvars` (or equivalent staging workspace's tfvars) the WebAuditIaC repo uses. Add:

```hcl
WebAudit_browsing_mode                 = "remote"
WebAudit_browsing_service_url          = "https://browser-service-staging.internal/v1"
page_builder_smoke_check_enabled      = true
```

Apply via the staging Terraform workflow. Rolling redeploy of the page-builder Cloud Run revision picks up the new env vars (Cloud Run replaces revisions, no in-place mutation).

PR title: **"chore(staging): flip page-builder to remote browsing (phase-4a.5)"**. Body links to this plan doc and tags the umbrella doc's §4a rollback playbook.

> **Note:** if the IaC repo doesn't separate environments via tfvars (e.g. uses Terraform workspaces or a different override mechanism), substitute the equivalent staging-only override location. The principle is unchanged: only staging gets `mode=remote` in this phase.

## Verification

### Pre-deploy (per commit)

- Commit 1: PageBuilder `mvn -pl . compile` + `mvn test` — no behavior change with default env vars.
- Commit 2: `terraform plan` — shows added env vars on the staging-bound page-builder revision; non-staging environments show no diff because of variable defaults.
- Commit 3: `terraform plan` against staging shows `WebAudit_BROWSING_MODE` flipping `local → remote`, plus the smoke-check vars.

### Post-deploy (staging) — first 5 minutes

- Cloud Run page-builder revision rolls out.
- `CapturePageSmokeCheck` log line appears: `CapturePageSmokeCheck started: interval=60000ms target=https://example.com`.
- First probe fires immediately (initial-delay 0 from the 4a.4 fix).
- Dashboard shows `browser_service_smoke_checks{outcome=success,consumer=page-builder}` ticking once per 60s.
- Real PageBuilder traffic shows `browser_service_calls{outcome=success}` increasing on the dashboard.

### Burn-in pass criteria (umbrella doc §4a.5)

48 hours green. All metric expressions reference the timer's exported Prometheus series (`browser_service_calls_seconds_count` / `_sum` / `_max`) per the umbrella §Observability prereqs metric contract — bare `browser_service_calls{...}` is not a real series.
- **Error rate <1%** averaged over any 15-minute window:
  ```
  sum(rate(browser_service_calls_seconds_count{consumer="page-builder", outcome="failure"}[15m]))
    /
  sum(rate(browser_service_calls_seconds_count{consumer="page-builder"}[15m]))
  ```
- **p95 latency within 2× the local-mode baseline**: `histogram_quantile(0.95, sum by (le) (rate(browser_service_calls_seconds_bucket{consumer="page-builder"}[5m])))`. Capture the local baseline from the 24 hours immediately before the flip.
- No new Sentry regressions tagged `service:page-builder`.
- Smoke-check failure rate <1%: `sum(rate(browser_service_smoke_checks_total{consumer="page-builder", outcome="failure"}[15m])) / sum(rate(browser_service_smoke_checks_total{consumer="page-builder"}[15m]))`. Small steady-state failures from genuine browser-service hiccups are acceptable; sustained failure means rollback.

### Burn-in fail → rollback

Any of: error rate >5% for >2 minutes, p95 >3× baseline, any Sentry new-regression in PageBuilder, browser-service returning 5xx.

1. Edit staging tfvars **— set both at once**:
   ```hcl
   WebAudit_browsing_mode            = "local"
   page_builder_smoke_check_enabled = false
   ```
   Both are required: `CapturePageSmokeCheck.prepare()` throws `IllegalStateException` on startup if `smoke-check.enabled=true` while `mode!=remote` (the mode-gate added in 4a.4 to prevent false-green metrics from a local-mode probe). Flipping mode without disabling the watchdog will crash-loop the next Cloud Run revision and turn the rollback into an outage.
2. `terraform apply` against staging.
3. Cloud Run rolling redeploy completes in ≤10 minutes.
4. Confirm via dashboard: `rate(browser_service_calls_seconds_count{consumer="page-builder"}[1m])` drops to zero (no remote traffic), local Selenium driver loads on next page-builder request.
5. File an incident note. Do not re-flip until root cause is understood and fixed in either browser-service, WebAuditCore, or PageBuilder. Restart the 48-hour burn-in clock.

## Critical files

- `PageBuilder/src/main/resources/application.yml` — add smoke-check property bindings (Commit 1)
- `WebAuditIaC/GCP/modules/cloud_run/variables.tf` — new `plain_environment_variables` parameter (Commit 2)
- `WebAuditIaC/GCP/modules/cloud_run/main.tf` — new `dynamic "env"` block rendering plain key/value vars (Commit 2)
- `WebAuditIaC/GCP/modules.tf` — `page_builder_cloud_run` block, add a sibling `plain_environment_variables` argument (Commit 2)
- `WebAuditIaC/GCP/variables.tf` — five new tfvars (Commit 2)
- `WebAuditIaC/GCP/<staging tfvars>` — three value overrides (Commit 3)

## Issue + PRs

Open one tracking issue covering all three commits, since the burn-in is the unit of completion. PRs reference `Closes #<issue>` only on the final (Commit 3) PR — the earlier two are inert without the tfvar flip and shouldn't auto-close the tracking issue on merge.

PR titles already specified per commit. Each PR body links back to this plan doc and to the umbrella `phase-4-consumer-cutover.md` §4a.5.

## Definition of done

- [x] Commit 1 merged (PageBuilder smoke-check env-var bindings).
- [x] Commit 2 merged (WebAuditIaC env-var plumbing).
- [x] Commit 3 merged + applied (staging tfvar flip).
- [x] Cloud Run page-builder staging revision is on the new revision with `WebAudit_BROWSING_MODE=remote`.
- [x] 48 consecutive hours of green burn-in observed against the criteria above.
- [x] No rollback executed during the burn-in window.

When all six boxes are checked, phase 4a.5 is complete and 4a.6 (prod flip) is unblocked. Per the umbrella doc, prod flip additionally requires a 7-day calm staging window and a fresh rollback dry-run within the prior 7 days — those gates are part of 4a.6, not this phase.
