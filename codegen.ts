import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    schema: 'http://localhost:8086/graphql',
    documents: 'src/graphql/**/*.graphql',
    generates: {
        './src/gql/': {
            preset: 'client',
            presetConfig: {
                gqlTagName: 'gql'
            }
        },
        './src/gql/sdk.ts': {
            plugins: ['typescript', 'typescript-operations', 'typescript-graphql-request']
        }
    },
    ignoreNoDocuments: true,
    config: {
        useTypeImports: true,
        dedupeFragments: true,
        inlineFragmentTypes: 'combine'
    }
};

export default config;
