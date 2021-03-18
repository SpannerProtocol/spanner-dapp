export default {
  types: {
    TradingPair: '(CurrencyId, CurrencyId)',
    TradingPairStatus: {
      _enum: {
        NotEnabled: null,
        Provisioning: 'TradingPairProvisionParameters',
        Enabled: null,
      },
    },
    TradingPairProvisionParameters: {
      min_contribution: '(Balance, Balance)',
      target_provision: '(Balance, Balance)',
      accumulated_provision: '(Balance, Balance)',
      not_before: 'BlockNumber',
    },
  },
}
