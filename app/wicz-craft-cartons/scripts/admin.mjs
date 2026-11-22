// Admin API access through the GraphiQL proxy that `shopify app dev` runs.
export const API_VERSION = '2026-07';

/** Returns gql(query, variables) bound to the GraphiQL URL `shopify app dev` prints. */
export function connect(graphiqlUrl) {
  const { origin, searchParams } = new URL(graphiqlUrl);
  const endpoint = `${origin}/graphiql/graphql.json?key=${searchParams.get('key')}&api_version=${API_VERSION}`;
  return async function gql(query, variables = {}) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    const body = await response.json();
    if (body.errors?.length) throw new Error(JSON.stringify(body.errors, null, 2));
    return body.data;
  };
}

export function assertNoUserErrors(label, errors) {
  if (errors?.length) throw new Error(`${label}: ${JSON.stringify(errors)}`);
}
