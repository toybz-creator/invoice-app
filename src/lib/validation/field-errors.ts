export function fieldErrorsFromIssues(
  issues: Array<{ path: PropertyKey[]; message: string }>,
) {
  return issues.reduce<Record<string, string[]>>((errors, issue) => {
    const field = String(issue.path[0] ?? "form");
    errors[field] = [...(errors[field] ?? []), issue.message];
    return errors;
  }, {});
}
