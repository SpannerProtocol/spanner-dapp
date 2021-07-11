/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: DpoEvents
// ====================================================

export interface DpoEvents_dpo {
  __typename: "Dpo";
  id: string;
  events: string | null;
}

export interface DpoEvents {
  dpo: DpoEvents_dpo | null;
}

export interface DpoEventsVariables {
  id: string;
}
