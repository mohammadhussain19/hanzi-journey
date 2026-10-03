# Contributing

Thanks for helping make Mandarin learning clearer and more accessible.

## Development setup

1. Fork and clone the repository.
2. Install Node.js 24 and npm dependencies with `npm install`.
3. Copy `.env.example` to `.env`, add a PostgreSQL `DATABASE_URL`, and set `AUTH_SECRET`.
4. Run `npm run db:migrate` and `npm run db:seed`.
5. Start the app with `npm run dev`.

## Before opening a pull request

- Keep changes focused and explain the learner problem they address.
- Run `npm run lint`, `npm run typecheck`, and `npm test`.
- For account or learning-flow changes, run `npm run test:e2e` with a disposable migrated database and a test-only `AUTH_SECRET`.
- Do not commit `.env`, credentials, generated Prisma output, or learner data.

## Curriculum contributions

Lesson content lives under `content/hsk1/unit-*/lesson-*.json`. Keep content beginner-friendly and provide simplified characters, tone-marked pinyin, a plain English meaning, part of speech, a natural example, example pinyin, and an English example translation. Use stable unique IDs. Do not describe community-authored content as officially approved HSK material.

## Pull request checklist

- [ ] The change has a clear purpose and scope.
- [ ] Content and code are reviewed for accuracy and accessibility.
- [ ] Lint, typecheck, and relevant tests pass.
- [ ] Documentation or environment examples are updated when needed.
