import { config as loadEnv } from 'dotenv';
import type { CodegenConfig } from "@graphql-codegen/cli";

loadEnv({ path: '.env.local' });

const codegenConfig: CodegenConfig = {
  overwrite: true,
  schema: process.env.EXPO_PUBLIC_API_URL + "/graphql",
  documents: "./constants/Queries.ts",
  generates: {
    "./constants/GraphqlTypes.ts": {
      plugins: ["typescript"],
      config: {
        preset: "client",
        presetConfig: {
          gqlTagName: "gql",
        },
        skipTypename: true,
      },
    },
  },
};

export default codegenConfig;
