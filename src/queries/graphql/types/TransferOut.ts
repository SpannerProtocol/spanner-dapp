/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: TransferOut
// ====================================================

export interface TransferOut_account_transferOut_nodes {
  __typename: "Transfer";
  id: string;
  amount: any;
  token: string;
  fromId: string;
  toId: string;
  timestamp: any;
}

export interface TransferOut_account_transferOut {
  __typename: "TransfersConnection";
  /**
   * The count of *all* `Transfer` you could get from the connection.
   */
  totalCount: number;
  /**
   * A list of `Transfer` objects.
   */
  nodes: (TransferOut_account_transferOut_nodes | null)[];
}

export interface TransferOut_account {
  __typename: "Account";
  /**
   * Reads and enables pagination through a set of `Transfer`.
   */
  transferOut: TransferOut_account_transferOut;
}

export interface TransferOut {
  account: TransferOut_account | null;
}

export interface TransferOutVariables {
  address: string;
  first: number;
  offset: number;
}
