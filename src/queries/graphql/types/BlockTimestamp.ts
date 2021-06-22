/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: BlockTimestamp
// ====================================================

export interface BlockTimestamp_block {
  __typename: "Block";
  id: string;
  number: any;
  timestamp: any;
}

export interface BlockTimestamp {
  block: BlockTimestamp_block | null;
}

export interface BlockTimestampVariables {
  hash: string;
}
