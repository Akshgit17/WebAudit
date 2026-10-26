# Phase 4a.4 — `CapturePageSmokeCheck` Bean

> **Goal:** Ship a small, opt-in Spring bean in `webaudit-core` that periodically calls `browserService.capturePage(...)` against the configured `WebAudit.browsing.service-url` and reports success/failure via Micrometer + structured logs. This is the WebAuditCore-side half of the "dashboard + smoke-check live before every flip" gate from `phase-4-consumer-cutover.md` §Observability prereqs. The bean exists in code starting now; it gets enabled per-consumer at deploy time once browser-service is reachable.
>
> **Where to work:** locally in the WebAudit monorepo against WebAuditCore. Suggest a feature branch: `git checkout -b phase-4a4/smoke-check-bean`.
>
> **Sibling references:** [`phase-4-consumer-cutover.md`](./phase-4-consumer-cutover.md) §4a.4 + §Observability prereqs (the full metric contract). Mirrors the structure of phase-3c/3d/3e/3f (small, scoped, focused).

## Why this phase exists now

Phase 3f (WebAuditCore 0.8.1, just merged) finished the WebAuditCore-side remote-compat surface. The active consumer set (PageBuilder, element-enrichment, journeyExecutor) plus the broader WebElement API on `RemoteWebElement` all work in remote mode. **The remaining external blocker for any phase-4 cutover is browser-service deployment.**

But there's one piece of WebAuditCore-side phase-4 prep still missing: the `CapturePageSmokeCheck` bean that the phase-4 doc §4a.4 calls a "watchdog during rollout". The phase-4 doc sketched it as:

```java
@Component
@ConditionalOnProperty(name = "WebAudit.browsing.smoke-check.enabled", havingValue = "true")
public class CapturePageSmokeCheck {
    @Scheduled(fixedRate = 60_000)
    public void probe() { /* browserService.capturePage(https://example.com, CHROME, -1L) + counter */ }
}
```

That sketch never got expanded into a real spec. Phase 4a.4 expands it: defines exact configuration properties, the metric contract, error handling, test surface, and the on-by-default-but-disabled-via-conditional pattern that lets every consumer ship the bean without it firing until they explicitly opt in.

Importantly, **this bean is implementable today without browser-service being deployed**. When `WebAudit.browsing.smoke-check.enabled=false` (the default), the bean simply isn't created. When enabled but browser-service is unreachable, the bean reports failure on every probe — exactly the watchdog signal we want during the staging burn-in (4a.5).

## Scope

| In scope | Out of scope |
|---|---|
| New `CapturePageSmokeCheck` Spring `@Component` in `WebAuditCore/webaudit-core/src/main/java/com/webaudit/services/health/` | Dashboard JSON / Grafana panels — those live in the infra repo |
| New `WebAudit.browsing.smoke-check.*` properties on `WebAuditBrowsingProperties` (`enabled`, `interval`, `target-url`, `browser`) | New endpoint (`/v1/healthz`-driven probing) — `capturePage` is the more end-to-end signal anyway |
| Micrometer instrumentation per the phase-4 metric contract: counter `browser_service_smoke_checks{outcome=success\|failure}` | Alert rules — those live in the same infra repo as the dashboard |
| Structured warn log on failure with the operation + status code | Sentry-specific wiring — the warn log is enough; Sentry will pick it up via the existing logback config |
| `@EnableScheduling` activation guarded so consumers without scheduling enabled still work | A `@RestController` that exposes the smoke-check status via HTTP — out of scope; the metrics + logs are the read path |
| Tests: scheduled invocation, success/failure metric paths, configuration binding, conditional bean creation | Live integration test against a real browser-service — same policy as phase 3 / 3b / 3c / 3d / 3e / 3f |
| WebAuditCore 0.8.1 → **0.8.2** patch + 13 consumer pom pins | Any change to local-mode behavior |

If the smoke-check ever needs more than what's listed here (e.g. multiple target URLs, alert-routing logic, status endpoint), that's a phase-5 candidate — not this phase.

## Locked decisions (from planning)

| Area | Decision |
|---|---|
| Bean location | `WebAuditCore/webaudit-core/src/main/java/com/webaudit/services/health/CapturePageSmokeCheck.java`. New `health` package — no existing services package matches well; smoke-check is health-adjacent. |
| Default enabled state | `false`. Consumers opt in by setting `WebAudit.browsing.smoke-check.enabled=true`. Prevents accidental production probing when WebAuditCore is upgraded. |
| Default interval | `60s` per the phase-4 doc sketch. Configurable via `WebAudit.browsing.smoke-check.interval` as a `Duration`. |
| Default target URL | `https://example.com` per the phase-4 doc sketch. Configurable via `WebAudit.browsing.smoke-check.target-url`. RFC 2606 reserves example.com for documentation; safe default. |
| Default browser | `BrowserType.CHROME` per the phase-4 doc sketch. Configurable. |
| `auditRecordId` | Hard-coded `-1L` — no real audit being recorded. Document in javadoc. |
| Metric contract | Counter `browser_service_smoke_checks` with one tag: `outcome` ∈ `{success, failure}`. **Does not** add the `consumer` tag — that's the consumer's `MeterFilter.commonTags` responsibility (same pattern as phase 4a.1 facade instrumentation). |
| Failure handling | Catch `Throwable` (broadest possible — we don't want a probe failure to crash the scheduler), log warn with the failure type + message, increment the failure counter. Don't rethrow. |
| Conditional gating | `@ConditionalOnProperty(name = "WebAudit.browsing.smoke-check.enabled", havingValue = "true")`. Bean isn't even instantiated when disabled. No runtime overhead for opted-out consumers. |
| Scheduling mechanism | **`SchedulingConfigurer` + `PeriodicTrigger`**, not `@Scheduled(fixedRateString = ...)`. `@EnableConfigurationProperties` registers `WebAuditBrowsingProperties` under a bean name like `WebAudit.browsing-com.webaudit.config.WebAuditBrowsingProperties` (per Spring's properties-binding convention), not `WebAuditBrowsingProperties` — so a SpEL `@bean` reference in `fixedRateString` fails to resolve at startup and prevents the app from booting. `SchedulingConfigurer` reads the bound `Duration` directly at task-registration time and is the canonical Spring pattern for runtime-configured intervals. |
| `@EnableScheduling` | The `SchedulingConfigurer` interface implementation registers tasks via the `ScheduledTaskRegistrar` Spring provides, which itself depends on the consumer's `@EnableScheduling` (or auto-config equivalent). If absent, `SchedulingConfigurer.configureTasks` simply isn't called and the bean exists without firing — same "visible-as-flat-zero-counter" failure mode as the original sketch, with no SpEL fragility. |
| Version bump | 0.8.1 → **0.8.2** (patch). Pure additive, conditional bean — no public API change, no behavior change for opted-out consumers. Same sizing as 4a.1 (which shipped facade instrumentation as 0.6.1). |

## Prerequisites

```bash
java -version     # 17.x
mvn -v            # 3.9+
git status        # clean working tree on main
```

- Phase 3f merged (WebAuditCore 0.8.1 on `main`) — confirmed.
- `BrowserService.capturePage(URL, BrowserType, long)` exists and is tested (phase 3 added it, phase 3c made it remote-safe).
- `WebAuditBrowsingProperties` exists at `WebAuditCore/webaudit-core/src/main/java/com/webaudit/config/WebAuditBrowsingProperties.java` (phase 3).

## Step 0 — Branch + sanity

```bash
cd /path/to/WebAudit
git checkout -b phase-4a4/smoke-check-bean

cd WebAuditCore && mvn -q verify
cd ..
```

Expect: 0.8.1 baseline green (webaudit-core 205 tests, browsing-client 32).

## Step 1 — Extend `WebAuditBrowsingProperties` with smoke-check sub-properties

**File:** `WebAuditCore/webaudit-core/src/main/java/com/webaudit/config/WebAuditBrowsingProperties.java`

Add a nested `SmokeCheck` class + getter:

```java
private final SmokeCheck smokeCheck = new SmokeCheck();
public SmokeCheck getSmokeCheck() { return smokeCheck; }

public static class SmokeCheck {
    private boolean enabled = false;
    private Duration interval = Duration.ofSeconds(60);
    private String targetUrl = "https://example.com";
    private com.webaudit.browser.enums.BrowserType browser = com.webaudit.browser.enums.BrowserType.CHROME;

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public Duration getInterval() { return interval; }
    public void setInterval(Duration interval) { this.interval = interval; }
    public String getTargetUrl() { return targetUrl; }
    public void setTargetUrl(String targetUrl) { this.targetUrl = targetUrl; }
    public com.webaudit.browser.enums.BrowserType getBrowser() { return browser; }
    public void setBrowser(com.webaudit.browser.enums.BrowserType browser) { this.browser = browser; }
}
```

**Commit:** `feat(core): add smoke-check sub-properties to WebAuditBrowsingProperties`

## Step 2 — Add `CapturePageSmokeCheck` bean

**File:** `WebAuditCore/webaudit-core/src/main/java/com/webaudit/services/health/CapturePageSmokeCheck.java`

Inline the full class. Note this implements `SchedulingConfigurer` rather than using `@Scheduled` — see Locked decisions for the bean-name SpEL trap that approach hits with `@EnableConfigurationProperties`.

```java
package com.webaudit.services.health;

import com.webaudit.config.WebAuditBrowsingProperties;
import com.webaudit.services.BrowserService;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import java.net.URL;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;
import org.springframework.scheduling.support.PeriodicTrigger;

/**
 * Periodically calls {@link BrowserService#capturePage} against the configured
 * {@code WebAudit.browsing.smoke-check.target-url} and reports success/failure
 * via Micrometer + structured logs. Doubles as a watchdog during phase-4
 * staging burn-in and prod cutover (see
 * {@code browser-service/phase-4-consumer-cutover.md} §4a.4).
 *
 * <p>Disabled by default; opt in per-consumer with
 * {@code WebAudit.browsing.smoke-check.enabled=true}. When disabled the bean
 * isn't created — zero runtime overhead.
 *
 * <p>Metric contract: counter {@code browser_service_smoke_checks} with tag
 * {@code outcome=success|failure}. The {@code consumer} tag is the consumer's
 * {@code MeterFilter.commonTags} responsibility (same pattern as the phase-4a.1
 * facade instrumentation).
 *
 * <p>Implements {@link SchedulingConfigurer} rather than using
 * {@code @Scheduled(fixedRateString=...)} so the interval can be read from a
 * {@link java.time.Duration} property without needing a SpEL bean reference.
 * The {@code @EnableConfigurationProperties}-bound bean name (e.g.
 * {@code WebAudit.browsing-com.webaudit.config.WebAuditBrowsingProperties}) isn't
 * the camelCase form SpEL would expect, so a {@code @bean} reference in
 * {@code fixedRateString} would fail to resolve at startup. This pattern
 * sidesteps that — the interval is read directly via constructor-injected
 * {@code WebAuditBrowsingProperties}.
 *
 * <p>Note: scheduling itself depends on the consumer's app having
 * {@code @EnableScheduling} (or auto-config equivalent). If absent,
 * {@link #configureTasks} simply isn't invoked — bean exists, never fires,
 * visible as a flat-zero smoke-check counter on the dashboard.
 */
@Configuration
@ConditionalOnProperty(name = "WebAudit.browsing.smoke-check.enabled", havingValue = "true")
public class CapturePageSmokeCheck implements SchedulingConfigurer {

    private static final Logger log = LoggerFactory.getLogger(CapturePageSmokeCheck.class);
    private static final String METRIC_NAME = "browser_service_smoke_checks";

    private final BrowserService browserService;
    private final WebAuditBrowsingProperties props;
    private final MeterRegistry meterRegistry; // may be null

    public CapturePageSmokeCheck(BrowserService browserService,
                                 WebAuditBrowsingProperties props,
                                 ObjectProvider<MeterRegistry> meterRegistryProvider) {
        this.browserService = browserService;
        this.props = props;
        this.meterRegistry = meterRegistryProvider.getIfAvailable();
    }

    @Override
    public void configureTasks(ScheduledTaskRegistrar taskRegistrar) {
        // Reads the Duration property at registration time. PeriodicTrigger
        // accepts millis-as-long; convert via Duration.toMillis().
        long intervalMs = props.getSmokeCheck().getInterval().toMillis();
        taskRegistrar.addTriggerTask(this::probe, new PeriodicTrigger(intervalMs));
    }

    /** Visible-for-tests: package-private. */
    void probe() {
        String outcome = "failure";
        try {
            URL url = new URL(props.getSmokeCheck().getTargetUrl());
            browserService.capturePage(url, props.getSmokeCheck().getBrowser(), -1L);
            outcome = "success";
        } catch (Throwable t) {
            // Catch broadest — a probe failure must never crash the scheduler.
            log.warn("CapturePageSmokeCheck probe failed: {} ({})",
                t.getClass().getSimpleName(), t.getMessage());
        } finally {
            recordOutcome(outcome);
        }
    }

    private void recordOutcome(String outcome) {
        if (meterRegistry == null) return;
        Counter.builder(METRIC_NAME)
            .tag("outcome", outcome)
            .register(meterRegistry)
            .increment();
    }
}
```

A few important details:

- **`SchedulingConfigurer` over `@Scheduled`**: see Locked decisions. The plan-time SpEL approach `@Scheduled(fixedRateString = "#{@WebAuditBrowsingProperties.smokeCheck.interval.toMillis()}")` would fail to resolve the bean reference at startup and prevent the app from booting whenever a consumer set `smoke-check.enabled=true`. `SchedulingConfigurer` reads the bound Duration directly via constructor injection — no SpEL, no bean-name fragility.
- `ObjectProvider<MeterRegistry>` lets the bean construct fine even when no `MeterRegistry` is wired in the consumer (matches the phase-4a.1 facade-instrumentation safety contract). When absent, metric recording is silently a no-op.
- The interval is read once at `configureTasks` time. Runtime config changes need a restart — the right tradeoff for an internal smoke-check, and matches the previous `@Scheduled(fixedRateString=...)` semantics anyway.
- Catching `Throwable` (not just `Exception`) is intentional — `BrowsingClientException`, `IOException`, `IllegalArgumentException`, `OutOfMemoryError` (rare but possible) all need to be caught so the scheduler thread isn't poisoned.
- The "failure" default + "success" flip pattern is the same one phase 4a.1 used for facade instrumentation — guarantees an unexpected exception (missed by the catch) still records a failure metric.
- `probe()` is package-private (rather than `private`) so tests can invoke it directly without going through the scheduler.

**Commit:** `feat(core): add CapturePageSmokeCheck bean for phase-4 cutover watchdog`

## Step 3 — Tests

`WebAuditCore/webaudit-core/src/test/java/com/webaudit/services/health/CapturePageSmokeCheckTest.java`

```java
@ExtendWith(MockitoExtension.class)
class CapturePageSmokeCheckTest {

    @Mock BrowserService browserService;
    @Mock ObjectProvider<MeterRegistry> meterRegistryProvider;
    private SimpleMeterRegistry registry;
    private WebAuditBrowsingProperties props;
    private CapturePageSmokeCheck check;

    @BeforeEach void setUp() {
        registry = new SimpleMeterRegistry();
        when(meterRegistryProvider.getIfAvailable()).thenReturn(registry);
        props = new WebAuditBrowsingProperties();
        props.getSmokeCheck().setTargetUrl("https://example.com");
        check = new CapturePageSmokeCheck(browserService, props, meterRegistryProvider);
    }

    @Test void successfulProbe_recordsSuccessCounter() throws Exception { … }
    @Test void browsingClientFailure_recordsFailureCounter() throws Exception { … }
    @Test void capturePageThrows_doesNotPropagate() throws Exception { … }   // Throwable safety
    @Test void absentRegistry_isNoOp() { … }                                  // null meter registry
    @Test void probe_usesConfiguredBrowserAndUrl() throws Exception { … }     // ArgumentCaptor on capturePage
}
```

Plus a small `@SpringBootTest`-style test verifying the bean is **not** created when `WebAudit.browsing.smoke-check.enabled` is unset/false, and **is** created when set to `true`. Pattern matches the existing `BrowserServiceModeForkTest` style — minimal Spring context, manual property injection.

**Commit:** `test(core): cover CapturePageSmokeCheck happy-path + Throwable-safety + conditional creation`

## Step 4 — Version bump 0.8.1 → 0.8.2

Same pattern as prior patches.

CHANGELOG entry under `## [0.8.2]`:

```
### Added
- New `CapturePageSmokeCheck` Spring bean in `webaudit-core` — periodically calls `browserService.capturePage` against `WebAudit.browsing.smoke-check.target-url` and reports success/failure via Micrometer counter `browser_service_smoke_checks{outcome=success|failure}`. Disabled by default; opt in per-consumer with `WebAudit.browsing.smoke-check.enabled=true`. Doubles as a watchdog during phase-4 staging burn-in and prod cutover.
- `WebAuditBrowsingProperties.smokeCheck` sub-properties: `enabled` (default false), `interval` (default 60s), `target-url` (default https://example.com), `browser` (default CHROME).

### Changed
- No behavior change for opted-out consumers. The bean isn't created when `smoke-check.enabled=false`.

### After this release
The WebAuditCore-side preparation for phase 4 cutover is complete. The remaining work to enable production cutover (4a.5 staging flip, 4a.6 prod flip, 4b/4c) is **browser-service deployment** + the consumer-side dashboard and alert rules (which live in the infra repo, not WebAuditCore).
```

13 consumer pom pins.

**Commit:** `chore: bump WebAuditCore to 0.8.2 + CHANGELOG + consumer pins`

## Step 5 — Verification

1. `mvn clean verify` from WebAuditCore root — `BUILD SUCCESS` across all 11 modules. Test counts: webaudit-core ≥ **210** (was 205 in 0.8.1; +5 for the smoke-check tests).

2. **Conditional-creation check:**
   ```bash
   grep -rn "@ConditionalOnProperty" WebAuditCore/webaudit-core/src/main/java/com/webaudit/services/health/
   # Expect: one hit, on CapturePageSmokeCheck.
   ```

3. **Scope-preservation check:**
   ```bash
   git diff --stat main..HEAD -- WebAuditCore/webaudit-browser/
   # Expect: only the parent-version bump.
   ```

4. **Optional manual verification.** Start a Spring Boot app with both:
   - `WebAudit.browsing.mode=local` + `WebAudit.browsing.smoke-check.enabled=true` + `WebAudit.browsing.smoke-check.target-url=https://example.com`. Probe should hit example.com via local Chrome and record `outcome=success`.
   - `WebAudit.browsing.mode=remote` + `service-url=http://localhost:8080/v1` (browser-service unreachable). Probe should fail with `BrowsingClientException` and record `outcome=failure`. Confirms the watchdog signal works.

## Definition of done

- [ ] `CapturePageSmokeCheck` bean created in `webaudit-core`, guarded by `@ConditionalOnProperty`.
- [ ] `WebAuditBrowsingProperties.smokeCheck` sub-properties bound and tested.
- [ ] Scheduled probe records `browser_service_smoke_checks{outcome=success|failure}` counter.
- [ ] `Throwable` is caught — scheduler thread can never be poisoned.
- [ ] Bean works without a `MeterRegistry` (no-op metrics, log path still active).
- [ ] `mvn clean verify` green; test counts up.
- [ ] WebAuditCore 0.8.2 across all poms + 13 consumer pom pins.
- [ ] PR opened with title **"Phase 4a.4: CapturePageSmokeCheck bean"**.

## Push and open PR

`git push -u origin phase-4a4/smoke-check-bean`. PR with `Closes #<issue>`. Body links to this doc + phase-4 §4a.4. Explicit note: this is the **last WebAuditCore-side phase-4 prep deliverable**; everything from here on (4a.5 staging flip, 4a.6 prod flip, 4b/4c) is gated on browser-service deployment.

## 14. Open items flagged for reviewer

1. **Bean location.** `com.webaudit.services.health` is a new package. Alternative was `com.webaudit.services` directly, but a dedicated package signals the smoke-check is observability-adjacent rather than a domain service. If a future health-check (DB liveness, GCS connectivity, etc.) lands, it sits naturally beside this one.

2. **Why `SchedulingConfigurer` instead of `@Scheduled`.** Resolved during PR #56 review. `@EnableConfigurationProperties` registers `WebAuditBrowsingProperties` under a bean name like `WebAudit.browsing-com.webaudit.config.WebAuditBrowsingProperties` (per Spring's properties-binding convention), not the camelCase `WebAuditBrowsingProperties` SpEL would expect. A `@Scheduled(fixedRateString = "#{@bean.smokeCheck.interval.toMillis()}")` reference therefore fails to resolve at startup and would prevent the app from booting whenever `smoke-check.enabled=true`. `SchedulingConfigurer` reads the bound `Duration` directly via constructor-injected `WebAuditBrowsingProperties` — no SpEL, no bean-name fragility.

3. **`@EnableScheduling` not auto-applied.** Most Spring Boot apps have it via auto-config, but WebAuditCore can't assume. If a consumer enables the smoke-check but their app doesn't have scheduling enabled, the bean is silently a no-op. Document loudly in javadoc; maybe consider adding a `@PostConstruct` that warns once if the scheduler isn't running. Out of scope for now — the failure mode (zero-counter on dashboard) is visible if anyone's looking.

4. **Target URL hard-coded to `example.com`.** Default; documented; configurable. Real consumers should pick a known-good URL on their own infrastructure for prod probes (less variance, no cross-internet dependency). example.com is fine for staging.

5. **`auditRecordId = -1L`.** No real audit being recorded. The negative ID prevents accidental coupling to a real audit row if this somehow gets into a code path that persists the resulting `PageState`. Document in javadoc that smoke-check probes don't generate audit data.

6. **Metric naming.** `browser_service_smoke_checks` (plural) matches the phase-4 metric contract (`browser_service_calls` is also plural). Consistent. If a future smoke-check covers something other than capturePage, it should be a separate metric, not an additional `operation` tag.

7. **No alert rule shipped here.** The dashboard JSON + alert rules (e.g. "fire if smoke-check failure rate > 10% over 5 minutes") live in the infra repo. The phase-4 doc §4a.4 lists those as separate artifacts; this phase ships only the WebAuditCore half.

8. **After this PR, the WebAuditCore-side phase-4 prep is _complete_.** Every executable WebAuditCore deliverable from the phase-4 plan doc has shipped (4a.1 instrumentation, 4a.3 env-var plumbing, plus the entire 3-series of remote-compat work that was a phase-4 prerequisite). The remaining phase-4 work — 4a.5/4a.6/4b/4c flips — is gated entirely on browser-service deployment + the infra-repo dashboard. Recommend pausing WebAuditCore-side phase work after this merges and pivoting attention to browser-service deployment readiness.
