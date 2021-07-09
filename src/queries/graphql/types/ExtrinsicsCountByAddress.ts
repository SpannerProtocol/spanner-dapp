/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ExtrinsicsCountByAddress
// ====================================================

export interface ExtrinsicsCountByAddress_extrinsics {
  __typename: "ExtrinsicsConnection";
  /**
   * The count of *all* `Extrinsic` you could get from the connection.
   */
  totalCount: number;
}

export interface ExtrinsicsCountByAddress {
  /**
   * Reads and enables pagination through a set of `Extrinsic`.
   */
  extrinsics: ExtrinsicsCountByAddress_extrinsics | null;
}

export interface ExtrinsicsCountByAddressVariables {
  address: string;
}
