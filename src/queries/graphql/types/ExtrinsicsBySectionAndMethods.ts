/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ExtrinsicsBySectionAndMethods
// ====================================================

export interface ExtrinsicsBySectionAndMethods_extrinsics_nodes_block {
  __typename: "Block";
  id: string;
  number: any;
}

export interface ExtrinsicsBySectionAndMethods_extrinsics_nodes {
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
  block: ExtrinsicsBySectionAndMethods_extrinsics_nodes_block | null;
  isSuccess: boolean;
}

export interface ExtrinsicsBySectionAndMethods_extrinsics {
  __typename: "ExtrinsicsConnection";
  /**
   * The count of *all* `Extrinsic` you could get from the connection.
   */
  totalCount: number;
  /**
   * A list of `Extrinsic` objects.
   */
  nodes: (ExtrinsicsBySectionAndMethods_extrinsics_nodes | null)[];
}

export interface ExtrinsicsBySectionAndMethods {
  /**
   * Reads and enables pagination through a set of `Extrinsic`.
   */
  extrinsics: ExtrinsicsBySectionAndMethods_extrinsics | null;
}

export interface ExtrinsicsBySectionAndMethodsVariables {
  section: string;
  method: string;
}
