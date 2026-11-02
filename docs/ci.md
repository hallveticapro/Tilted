# CI verification

The `verify` required-check identity remains an always-run aggregate. It requires
success from all static, build, and browser lanes. Failure, cancellation, and
skipped prerequisites fail the gate; static matrix fail-fast is disabled.

Typecheck, lint, and the complete existing unit command run independently. The
production build and `verify:static` remain ordered in one job so security
headers, service-worker versioning, health, metadata, and cache assertions inspect
that job's actual output. The complete browser command runs on its own runner;
its unchanged Playwright web server builds before starting preview. Each runner
owns its build outputs, ports, fixtures, browser profiles, and test results.
No assertions, browser projects, retries, exclusions, or timeouts change.

Five work runners plus the aggregate replace one runner. Extra checkout,
dependency installation, and runner-minute rounding can increase billed usage;
concurrency limits can reduce the expected wall-clock improvement. Record the
first comparable successful GitHub run's elapsed time, queue delay, per-job
durations, and total billed minutes before reporting savings. After timings remain
pending. The separate container publication workflow is unchanged by this split.
