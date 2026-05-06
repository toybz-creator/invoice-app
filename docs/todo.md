- Use `docs/FRD.md` as the functional requirements source.
- Use `docs/NFRD.md` as the non-functional requirements source.
- Use `docs/architecture-guide.md` as the architecture and implementation guide.
- Use `docs/task.md` as the step-by-step implementation plan.
- Use the local reference images in `docs/ui-design/` for UI tasks before coding: inspect the matching image, identify assets, implement with local conventions, and verify against the image in the browser.
- During implementation, keep README setup/dependency docs, in-code documentation, unit tests, and e2e tests updated alongside code changes.
- Compartmentalise the app more by seeing where code are use twice and turning them into components, some known cases are:
  Loading component, Invoice Table, invoice modals, page headers? etc
- Graph and UI fixes across app
