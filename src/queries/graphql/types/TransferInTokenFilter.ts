/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: TransferInTokenFilter
// ====================================================

export interface TransferInTokenFilter_account_transferIn_nodes {
  __typename: "Transfer";
  id: string;
  amount: any;
  token: string;
  fromId: string;
  toId: string;
  timestamp: any;
}

export interface TransferInTokenFilter_account_transferIn {
  __typename: "TransfersConnection";
  /**
   * A list of `Transfer` objects.
   */
  nodes: (TransferInTokenFilter_account_transferIn_nodes | null)[];
}

export interface TransferInTokenFilter_account {
  __typename: "Account";
  /**
   * Reads and enables pagination through a set of `Transfer`.
   */
  transferIn: TransferInTokenFilter_account_transferIn;
}

export interface TransferInTokenFilter {
  account: TransferInTokenFilter_account | null;
}

export interface TransferInTokenFilterVariables {
  address: string;
  first: number;
  offset: number;
  token: string;
}
