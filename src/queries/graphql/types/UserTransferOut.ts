/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: UserTransferOut
// ====================================================

export interface UserTransferOut_account_transferOut_nodes_event_extrinsic {
  __typename: "Extrinsic";
  section: string;
  method: string;
  args: string;
}

export interface UserTransferOut_account_transferOut_nodes_event {
  __typename: "Event";
  /**
   * Reads a single `Extrinsic` that is related to this `Event`.
   */
  extrinsic: UserTransferOut_account_transferOut_nodes_event_extrinsic | null;
}

export interface UserTransferOut_account_transferOut_nodes {
  __typename: "Transfer";
  amount: any;
  token: string;
  timestamp: any;
  /**
   * Reads a single `Event` that is related to this `Transfer`.
   */
  event: UserTransferOut_account_transferOut_nodes_event | null;
}

export interface UserTransferOut_account_transferOut {
  __typename: "TransfersConnection";
  /**
   * The count of *all* `Transfer` you could get from the connection.
   */
  totalCount: number;
  /**
   * A list of `Transfer` objects.
   */
  nodes: (UserTransferOut_account_transferOut_nodes | null)[];
}

export interface UserTransferOut_account {
  __typename: "Account";
  /**
   * Reads and enables pagination through a set of `Transfer`.
   */
  transferOut: UserTransferOut_account_transferOut;
}

export interface UserTransferOut {
  account: UserTransferOut_account | null;
}

export interface UserTransferOutVariables {
  address: string;
}
