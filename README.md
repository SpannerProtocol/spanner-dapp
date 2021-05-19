# Spanner Dapp

[![Styled With Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

An open source interface for Spanner.

## Getting Started

```bash
# install dependencies
yarn

# get types from spanner-interfaces
cd src/spanner-interfaces
git submodule update --init --recursive
git pull origin master
# build spanner
yarn build:types

# if apollo types are needed for subql
yarn build:apollo-types

# start development server
yarn start
```

## Configuring the environment (optional)
Some of the environment configuration is currently not available yet until Mainnet Launch.
1. Make a copy of `.env.example` named `.env.local`
2. Change `REACT_APP_NETWORK_ID` to `"{YOUR_NETWORK_ID}"`
3. Change `REACT_APP_NETWORK_URL` to e.g. `"https://{YOUR_NETWORK_ID}.infura.io/v3/{YOUR_INFURA_KEY}"` 
