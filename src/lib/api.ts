import { getSdk } from '@/gql/sdk';
import { GraphQLClient } from 'graphql-request';

const endpoint = import.meta.env.WORDPRESS_API_URL;
if (!endpoint) {
    throw new Error('Missing WORDPRESS_API_URL');
}
const graphqlEndpoint = `${endpoint}/graphql`;
const jwtEndpoint = `${endpoint}/wp-json/jwt-auth/v1/token`;
const username = import.meta.env.SUBSCRIBER_USER_USERNAME;
const password = import.meta.env.SUBSCRIBER_USER_PASSWORD;

const client = new GraphQLClient(graphqlEndpoint);
const sdk = getSdk(client);

export const getNodeByUri = async ({
    uri,
    categoryName,
    first,
    after,
    last,
    before
}: {
    uri: string;
    categoryName: string;
    first: number | null;
    after: string | null;
    last: number | null;
    before: string | null;
}) => {
    return sdk.GetNodeByURI({ uri, idUri: uri, categoryName, first, after, last, before });
};

export const getAllTags = async () => {
    return sdk.GetTags();
};

export const getRssPosts = async () => {
    return sdk.GetRssPosts();
};

export const getJWTToken = async (): Promise<{
    token?: string;
    error?: string;
}> => {
    if (!username || !password) {
        return { error: 'Missing username or password' };
    }
    try {
        const response = await fetch(jwtEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const payload = await response.json();
        if (!response.ok) {
            return { error: payload?.message || 'Unknown error' };
        }
        return { token: payload?.token };
    } catch (error: unknown) {
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: 'Unknown error' };
    }
};

export const getAllUris = async (): Promise<string[]> => {
    const uris: string[] = [];
    let after: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
        const result = await sdk.GetAllUris({ first: 100, after });
        const nodes = result.contentNodes?.nodes ?? [];
        uris.push(...nodes.map((n) => n?.uri).filter((u): u is string => Boolean(u)));

        hasNextPage = result.contentNodes?.pageInfo?.hasNextPage ?? false;
        after = result.contentNodes?.pageInfo?.endCursor ?? null;
    }

    return uris;
};
