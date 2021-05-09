/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: PairPrice
// ====================================================

export interface PairPrice_pair_pairHourData_nodes {
  __typename: "PairHourDatum";
  pairId: string;
  price: string;
  hourStartTime: any;
  hourlyVolumeToken1: any;
  hourlyVolumeToken2: any;
  hourlyTxns: any;
  poolAmount1: any;
  poolAmount2: any;
}

export interface PairPrice_pair_pairHourData {
  __typename: "PairHourDataConnection";
  /**
   * The count of *all* `PairHourDatum` you could get from the connection.
   */
  totalCount: number;
  /**
   * A list of `PairHourDatum` objects.
   */
  nodes: (PairPrice_pair_pairHourData_nodes | null)[];
}

export interface PairPrice_pair {
  __typename: "Pair";
  /**
   * Reads and enables pagination through a set of `PairHourDatum`.
   */
  pairHourData: PairPrice_pair_pairHourData;
}

export interface PairPrice {
  pair: PairPrice_pair | null;
}

export interface PairPriceVariables {
  first: number;
  offset: number;
  pairId: string;
}
