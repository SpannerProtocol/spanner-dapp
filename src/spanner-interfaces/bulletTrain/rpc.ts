export default {
  rpc: {
    bulletTrain: {
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
  },
}
