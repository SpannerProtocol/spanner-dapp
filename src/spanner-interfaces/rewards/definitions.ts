export default {
  types: {
    PoolId: {
      _enum: {
        DexYieldFarming: 'CurrencyId',
      },
    },
    PoolInfo: {
      total_shares: 'Balance',
      total_rewards: 'Balance',
      total_withdrawn_rewards: 'Balance',
    },
  },
}
