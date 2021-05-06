/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Extrinsics
// ====================================================

export interface Extrinsics_extrinsics_nodes_block {
  __typename: "Block";
  id: string;
  number: string | null;
}

export interface Extrinsics_extrinsics_nodes {
  __typename: "Extrinsic";
  id: string;
  section: string | null;
  method: string | null;
  args: string | null;
  signerId: string | null;
  timestamp: any | null;
  /**
   * Reads a single `Block` that is related to this `Extrinsic`.
   */
  block: Extrinsics_extrinsics_nodes_block | null;
  isSuccess: boolean | null;
}

export interface Extrinsics_extrinsics {
  __typename: "ExtrinsicsConnection";
  /**
   * The count of *all* `Extrinsic` you could get from the connection.
   */
  totalCount: number;
  /**
   * A list of `Extrinsic` objects.
   */
  nodes: (Extrinsics_extrinsics_nodes | null)[];
}

export interface Extrinsics {
  /**
   * Reads and enables pagination through a set of `Extrinsic`.
   */
  extrinsics: Extrinsics_extrinsics | null;
}

export interface ExtrinsicsVariables {
  address: string;
  first: number;
  offset: number;
}
