import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "https://be.ilearnquran.org/graphql",
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

export default config;
