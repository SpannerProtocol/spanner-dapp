/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: DposTargetPurchasedIncludes
// ====================================================

export interface DposTargetPurchasedIncludes_events_nodes_extrinsic {
  __typename: "Extrinsic";
  args: string;
}

export interface DposTargetPurchasedIncludes_events_nodes {
  __typename: "Event";
  section: string;
  method: string;
  data: string;
  /**
   * Reads a single `Extrinsic` that is related to this `Event`.
   */
  extrinsic: DposTargetPurchasedIncludes_events_nodes_extrinsic | null;
}

export interface DposTargetPurchasedIncludes_events {
  __typename: "EventsConnection";
  /**
   * The count of *all* `Event` you could get from the connection.
   */
  totalCount: number;
  /**
   * A list of `Event` objects.
   */
  nodes: (DposTargetPurchasedIncludes_events_nodes | null)[];
}

export interface DposTargetPurchasedIncludes {
  /**
   * Reads and enables pagination through a set of `Event`.
   */
  events: DposTargetPurchasedIncludes_events | null;
}

export interface DposTargetPurchasedIncludesVariables {
  includes: string;
}
