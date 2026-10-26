package com.webaudit.llm.resilience;

import com.webaudit.llm.ImagePart;
import com.webaudit.llm.LlmClient;
import com.webaudit.llm.LlmException;
import com.webaudit.llm.LlmException.LlmBudgetExceededException;
import com.webaudit.llm.LlmException.LlmCapabilityException;
import com.webaudit.llm.LlmException.LlmContentFilterException;
import com.webaudit.llm.LlmException.LlmRateLimitException;
import com.webaudit.llm.LlmRequest;
import com.webaudit.llm.LlmResponse;
import com.webaudit.llm.ModelInfo;
import java.io.IOException;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

/**
 * Retries LLM calls with exponential backoff on retryable errors only.
 *
 * <p>Retryable: {@link LlmRateLimitException}, {@link IOException} wrapped in
 * {@link LlmException}. <b>Terminal</b> (never retried):
 * {@link LlmContentFilterException}, {@link LlmBudgetExceededException},
 * {@link LlmCapabilityException}.
 *
 * <p>Implementation note: we roll a small bespoke retry loop rather than wiring
 * Resilience4j's fluent API because the retry-vs-terminal distinction here is
 * by exception type and we want timing to be deterministic for tests. The
 * shape mirrors {@link com.webaudit.gcp.PubSubPublisher}'s retry idiom.
 */
@Slf4j
public class RetryingLlmClient implements LlmClient {

    private final LlmClient delegate;
    private final int maxAttempts;
    private final long initialBackoffMillis;
    private final Sleeper sleeper;

    public RetryingLlmClient(LlmClient delegate, int maxAttempts, long initialBackoffMillis) {
        this(delegate, maxAttempts, initialBackoffMillis, Thread::sleep);
    }

    // Visible for testing.
    RetryingLlmClient(LlmClient delegate, int maxAttempts, long initialBackoffMillis, Sleeper sleeper) {
        this.delegate = delegate;
        this.maxAttempts = maxAttempts;
        this.initialBackoffMillis = initialBackoffMillis;
        this.sleeper = sleeper;
    }

    @FunctionalInterface
    interface Sleeper {
        void sleep(long millis) throws InterruptedException;
    }

    @Override
    public LlmResponse complete(LlmRequest request) {
        return withRetry(() -> delegate.complete(request));
    }

    @Override
    public LlmResponse completeWithVision(LlmRequest request, List<ImagePart> images) {
        return withRetry(() -> delegate.completeWithVision(request, images));
    }

    private LlmResponse withRetry(java.util.function.Supplier<LlmResponse> call) {
        LlmException last = null;
        long backoff = initialBackoffMillis;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return call.get();
            } catch (LlmContentFilterException | LlmBudgetExceededException | LlmCapabilityException terminal) {
                throw terminal;
            } catch (LlmRateLimitException e) {
                last = e;
                log.warn("LLM rate limited (attempt {}/{}): {}", attempt, maxAttempts, e.getMessage());
            } catch (LlmException e) {
                if (!isRetryable(e)) {
                    throw e;
                }
                last = e;
                log.warn("LLM transient failure (attempt {}/{}): {}", attempt, maxAttempts, e.getMessage());
            }
            if (attempt < maxAttempts) {
                try {
                    sleeper.sleep(backoff);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new LlmException("Retry interrupted", ie);
                }
                backoff *= 2;
            }
        }
        throw new LlmException("LLM call failed after " + maxAttempts + " attempts", last);
    }

    private boolean isRetryable(LlmException e) {
        return e.getCause() instanceof IOException;
    }

    @Override public String providerId() { return delegate.providerId(); }
    @Override public ModelInfo modelInfo() { return delegate.modelInfo(); }
}
