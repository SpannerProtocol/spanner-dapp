/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: TransferOutTokenFilter
// ====================================================

export interface TransferOutTokenFilter_account_transferOut_nodes {
  __typename: "Transfer";
  id: string;
  amount: any;
  token: string;
  fromId: string;
  toId: string;
  timestamp: any;
}

export interface TransferOutTokenFilter_account_transferOut {
  __typename: "TransfersConnection";
  /**
   * A list of `Transfer` objects.
   */
  nodes: (TransferOutTokenFilter_account_transferOut_nodes | null)[];
}

export interface TransferOutTokenFilter_account {
  __typename: "Account";
  /**
   * Reads and enables pagination through a set of `Transfer`.
   */
  transferOut: TransferOutTokenFilter_account_transferOut;
}

export interface TransferOutTokenFilter {
  account: TransferOutTokenFilter_account | null;
}

export interface TransferOutTokenFilterVariables {
  address: string;
  first: number;
  offset: number;
  token: string;
}
