/* eslint-disable @typescript-eslint/camelcase */
export default {
  types: {
    TravelCabinIndex: 'u32',
    TravelCabinInventoryIndex: 'u16',
    DpoIndex: 'u32',
    TravelCabinInfo: {
      creator: 'AccountId',
      token_id: 'CurrencyId',
      index: 'TravelCabinIndex',
      deposit_amount: 'Balance',
      bonus_total: 'Balance',
      yield_total: 'Balance',
      maturity: 'u32',
    },
    TravelCabinBuyerInfo: {
      buyer: 'Buyer',
      purchase_blk: 'BlockNumber',
      yield_withdrawn: 'Balance',
      fare_withdrawn: 'bool',
      blk_of_last_withdraw: 'BlockNumber',
    },
    MilestoneRewardInfo: {
      token_id: 'CurrencyId',
      deposited: 'Balance',
      milestones: 'Vec<(Balance, Balance)>',
    },
    DpoState: {
      _enum: ['CREATED', 'ACTIVE', 'RUNNING', 'FAILED', 'COMPLETED'],
    },
    Target: {
      _enum: {
        Dpo: '(DpoIndex, u8)',
        TravelCabin: 'TravelCabinIndex',
      },
    },
    Buyer: {
      _enum: {
        Dpo: 'DpoIndex',
        Passenger: 'AccountId',
        InvalidBuyer: null,
      },
    },
    DpoInfo: {
      index: 'DpoIndex',
      name: 'Text',
      token_id: 'CurrencyId',
      manager: 'AccountId',
      target: 'Target',
      target_amount: 'Balance',
      target_yield_estimate: 'Balance',
      target_bonus_estimate: 'Balance',
      amount_per_seat: 'Balance',
      commission_rate: 'u32',
      commission_rate_slashed: 'bool',
      empty_seats: 'u8',
      fifo: 'Vec<Buyer>',
      vault_deposit: 'Balance',
      vault_withdraw: 'Balance',
      vault_yield: 'Balance',
      vault_bonus: 'Balance',
      total_yield_received: 'Balance',
      total_bonus_received: 'Balance',
      total_milestone_received: 'Balance',
      blk_of_last_yield: 'Option<BlockNumber>',
      blk_of_dpo_filled: 'Option<BlockNumber>',
      expiry_blk: 'BlockNumber',
      state: 'DpoState',
      referrer: 'Option<AccountId>',
      fare_withdrawn: 'bool',
    },
    DpoMemberInfo: {
      buyer: 'Buyer',
      number_of_seats: 'u8',
      referrer: 'Referrer',
    },
    Referrer: {
      _enum: {
        None: null,
        MemberOfDpo: 'Buyer',
        External: '(AccountId, Buyer)',
      },
    },
    PaymentType: {
      _enum: [
        'Deposit',
        'Bonus',
        'MilestoneReward',
        'Yield',
        'UnusedFund',
        'WithdrawOnCompletion',
        'WithdrawOnFailure',
      ],
    },
  },
  rpc: {
    getTravelCabinsOfAccount: {
      description: 'Get travel cabins of account',
      params: [
        {
          name: 'account',
          type: 'AccountId',
        },
        {
          name: 'at',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'Vec<(TravelCabinIndex, TravelCabinInventoryIndex)>',
    },
    getDposOfAccount: {
      description: 'Get dpos of account',
      params: [
        {
          name: 'account',
          type: 'AccountId',
        },
        {
          name: 'at',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'Vec<DpoIndex>',
    },
  },
}
