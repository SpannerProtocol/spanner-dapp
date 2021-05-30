/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: UserTransferIn
// ====================================================

export interface UserTransferIn_account_transferIn_nodes_event_extrinsic {
  __typename: "Extrinsic";
  section: string;
  method: string;
  args: string;
}

export interface UserTransferIn_account_transferIn_nodes_event {
  __typename: "Event";
  /**
   * Reads a single `Extrinsic` that is related to this `Event`.
   */
  extrinsic: UserTransferIn_account_transferIn_nodes_event_extrinsic | null;
}

export interface UserTransferIn_account_transferIn_nodes {
  __typename: "Transfer";
  amount: any;
  token: string;
  timestamp: any;
  /**
   * Reads a single `Event` that is related to this `Transfer`.
   */
  event: UserTransferIn_account_transferIn_nodes_event | null;
}

export interface UserTransferIn_account_transferIn {
  __typename: "TransfersConnection";
  /**
   * The count of *all* `Transfer` you could get from the connection.
   */
  totalCount: number;
  /**
   * A list of `Transfer` objects.
   */
  nodes: (UserTransferIn_account_transferIn_nodes | null)[];
}

export interface UserTransferIn_account {
  __typename: "Account";
  /**
   * Reads and enables pagination through a set of `Transfer`.
   */
  transferIn: UserTransferIn_account_transferIn;
}

export interface UserTransferIn {
  account: UserTransferIn_account | null;
}

export interface UserTransferInVariables {
  address: string;
}
