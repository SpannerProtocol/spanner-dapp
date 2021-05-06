/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: TransferIn
// ====================================================

export interface TransferIn_account_transferIn_nodes {
  __typename: "Transfer";
  id: string;
  amount: string | null;
  token: string | null;
  fromId: string | null;
  toId: string | null;
  timestamp: any | null;
}

export interface TransferIn_account_transferIn {
  __typename: "TransfersConnection";
  /**
   * The count of *all* `Transfer` you could get from the connection.
   */
  totalCount: number;
  /**
   * A list of `Transfer` objects.
   */
  nodes: (TransferIn_account_transferIn_nodes | null)[];
}

export interface TransferIn_account {
  __typename: "Account";
  /**
   * Reads and enables pagination through a set of `Transfer`.
   */
  transferIn: TransferIn_account_transferIn;
}

export interface TransferIn {
  account: TransferIn_account | null;
}

export interface TransferInVariables {
  address: string;
  first: number;
  offset: number;
}
