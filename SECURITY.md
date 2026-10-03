# Security policy

## Supported versions

Security fixes are developed for the latest version on the repository’s default branch. Update dependencies and redeploy promptly when a fix is available.

## Reporting a vulnerability

Please do not post exploitable vulnerability details in a public issue. If the repository has GitHub private vulnerability reporting enabled, use **Security → Report a vulnerability**. Otherwise contact a repository maintainer privately and include reproduction steps, affected versions, and impact. Do not include real learner records or credentials in a report.

We will acknowledge reports, investigate them, and coordinate a fix and disclosure with the reporter. This project is community-maintained and does not promise a fixed response time.

## Secret handling

Never commit `.env`, database URLs, `AUTH_SECRET`, session cookies, or production learner data. Rotate any credential that is exposed, even if the commit is later removed.
