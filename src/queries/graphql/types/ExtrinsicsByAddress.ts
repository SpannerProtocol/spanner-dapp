/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ExtrinsicsByAddress
// ====================================================

export interface ExtrinsicsByAddress_extrinsics_nodes_block {
  __typename: "Block";
  id: string;
  number: any;
}

export interface ExtrinsicsByAddress_extrinsics_nodes {
  __typename: "Extrinsic";
  id: string;
  section: string;
  method: string;
  args: string;
  signerId: string;
  timestamp: any;
  /**
   * Reads a single `Block` that is related to this `Extrinsic`.
   */
  block: ExtrinsicsByAddress_extrinsics_nodes_block | null;
  isSuccess: boolean;
}

export interface ExtrinsicsByAddress_extrinsics {
  __typename: "ExtrinsicsConnection";
  /**
   * The count of *all* `Extrinsic` you could get from the connection.
   */
  totalCount: number;
  /**
   * A list of `Extrinsic` objects.
   */
  nodes: (ExtrinsicsByAddress_extrinsics_nodes | null)[];
}

export interface ExtrinsicsByAddress {
  /**
   * Reads and enables pagination through a set of `Extrinsic`.
   */
  extrinsics: ExtrinsicsByAddress_extrinsics | null;
}

export interface ExtrinsicsByAddressVariables {
  address: string;
  first: number;
  offset: number;
}
