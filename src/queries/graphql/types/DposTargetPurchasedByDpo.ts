/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: DposTargetPurchasedByDpo
// ====================================================

export interface DposTargetPurchasedByDpo_events_nodes_extrinsic {
  __typename: "Extrinsic";
  args: string;
}

export interface DposTargetPurchasedByDpo_events_nodes {
  __typename: "Event";
  section: string;
  method: string;
  data: string;
  /**
   * Reads a single `Extrinsic` that is related to this `Event`.
   */
  extrinsic: DposTargetPurchasedByDpo_events_nodes_extrinsic | null;
}

export interface DposTargetPurchasedByDpo_events {
  __typename: "EventsConnection";
  /**
   * The count of *all* `Event` you could get from the connection.
   */
  totalCount: number;
  /**
   * A list of `Event` objects.
   */
  nodes: (DposTargetPurchasedByDpo_events_nodes | null)[];
}

export interface DposTargetPurchasedByDpo {
  /**
   * Reads and enables pagination through a set of `Event`.
   */
  events: DposTargetPurchasedByDpo_events | null;
}
