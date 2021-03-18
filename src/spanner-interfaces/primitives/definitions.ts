export default {
  types: {
    Amount: 'i128',
    AmountOf: 'Amount',
    TokenSymbol: {
      _enum: ['BOLT', 'WUSD', 'WBTC', 'BBOT', 'DOGE', 'NCAT', 'PLKT', 'ZERO'],
    },
    CurrencyId: {
      _enum: {
        Token: 'TokenSymbol',
        DexShare: '(TokenSymbol, TokenSymbol)',
      },
    },
    CurrencyIdOf: 'CurrencyId',
  },
}
