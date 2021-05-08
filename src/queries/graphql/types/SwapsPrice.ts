/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SwapsPrice
// ====================================================

export interface SwapsPrice_swaps_nodes {
  __typename: "Swap";
  id: string;
  timestamp: any;
  token1: string;
  token2: string;
  tokenAmount1: any;
  tokenAmount2: any;
  price: string;
}

export interface SwapsPrice_swaps {
  __typename: "SwapsConnection";
  /**
   * The count of *all* `Swap` you could get from the connection.
   */
  totalCount: number;
  /**
   * A list of `Swap` objects.
   */
  nodes: (SwapsPrice_swaps_nodes | null)[];
}

export interface SwapsPrice {
  /**
   * Reads and enables pagination through a set of `Swap`.
   */
  swaps: SwapsPrice_swaps | null;
}

export interface SwapsPriceVariables {
  first: number;
  offset: number;
  token1: string;
  token2: string;
}
