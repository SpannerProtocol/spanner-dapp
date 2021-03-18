# Spanner Dapp

[![Styled With Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

An open source interface for Spanner.

### Install Dependencies

```bash
yarn
```

### Generate TypeScript definitions
```bash
yarn build:types
```

### Run

```bash
yarn start
```

### Configuring the environment (optional)
Some of the environment configuration is currently not available yet until Mainnet Launch.
1. Make a copy of `.env.example` named `.env.local`
2. Change `REACT_APP_NETWORK_ID` to `"{YOUR_NETWORK_ID}"`
3. Change `REACT_APP_NETWORK_URL` to e.g. `"https://{YOUR_NETWORK_ID}.infura.io/v3/{YOUR_INFURA_KEY}"` 
