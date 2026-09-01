/**
 * Passthrough template tag for GraphQL documents. Unlike `graphql-tag` this
 * does not parse the input into a `DocumentNode` — it just interpolates the
 * template and returns the string, which is all the subgraph client needs.
 *
 * It exists purely so that editors, formatters and linters — which key off a
 * template tag literally named `gql` — keep highlighting these queries.
 */
export const gql = (
  chunks: TemplateStringsArray,
  ...variables: unknown[]
): string =>
  chunks.reduce(
    (acc, chunk, index) =>
      `${acc}${chunk}${index in variables ? String(variables[index]) : ''}`,
    '',
  )
