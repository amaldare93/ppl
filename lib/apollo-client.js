import { ApolloClient, InMemoryCache, HttpLink, gql } from "@apollo/client";
import { cookies } from "next/headers";

const defaultAuthToken = process.env.WOTC_BEARER_TOKEN;

const GET_CURRENT_USER = gql`
  query getCurrentUser {
    me {
      displayName
      personaId
      isEmailVerified
      roles {
        roleName
        organization {
          id
          name
          acceptedTermsAndConditionsAt
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;

export function createClient(authToken = defaultAuthToken) {
  return new ApolloClient({
    link: new HttpLink({
      uri: "https://api.tabletop.wizards.com/silverbeak-griffin-service/graphql",
      fetch,
      headers: {
        Authorization: authToken ? `Bearer ${authToken}` : undefined,
        "x-wotc-client":
          "client:eventlink version:6ea86725 platform:Mac OS/chrome/150.0.0",
      },
    }),
    cache: new InMemoryCache(),
  });
}

export async function getAuthenticatedClient() {
  const authToken = (await cookies()).get("eventlink_auth_token")?.value;
  console.log("[apolloClient] authToken", authToken);
  return createClient(authToken);
}

export async function getCurrentUser() {
  const client = await getAuthenticatedClient();
  const { data } = await client.query({
    query: GET_CURRENT_USER,
    fetchPolicy: "no-cache",
  });

  return data.me ?? null;
}
