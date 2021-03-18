# spanner-interfaces

Refer to https://polkadot.js.org/docs/api/examples/promise/typegen for more information

```bash
git submodule add `this repo`
git submodule update --init --recursive
#to update to latest commit
cd spanner-interfaces
git pull origin master

#to generate metadata.json
 curl -H "Content-Type: application/json" -d '{"id":"1", "jsonrpc":"2.0", "method": "state_getMetadata", "params":[]}' http://localhost:9933 > metadata.json

Add to tsconfig.json
"paths": {
  "spanner-interfaces/*": ["`path to submodule`/spanner-interfaces/*"],
  "@polkadot/api/augment": ["`path to submodule`/spanner-interfaces/augment-api.ts"],
  "@polkadot/types/augment": ["`path to submodule`/spanner-interfaces/augment-types.ts"]
}

Add to package.json
- scripts
"build:types": "yarn generate:defs && yarn generate:meta",
"generate:defs": "ts-node --skip-project node_modules/.bin/polkadot-types-from-defs --package 'spanner-interfaces' --input `path to submodule`/spanner-interfaces",
"generate:meta": "ts-node --skip-project node_modules/.bin/polkadot-types-from-chain --package 'spanner-interfaces' --endpoint `path to submodule`/spanner-interfaces/metadata.json --output `path to submodule`/spanner-interfaces"

- devDependencies
"ts-node": "^9.0.0",
"typescript": "^4.0.5",
"@polkadot/typegen": "^2.3.1"

- dependencies / resolutions
"@polkadot/api": "^2.3.1"

yarn build:types
```

