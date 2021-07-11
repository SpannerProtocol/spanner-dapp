/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: EventsSMShort
// ====================================================

export interface EventsSMShort_events_nodes_extrinsic {
  __typename: "Extrinsic";
  args: string;
}

export interface EventsSMShort_events_nodes {
  __typename: "Event";
  data: string;
  /**
   * Reads a single `Extrinsic` that is related to this `Event`.
   */
  extrinsic: EventsSMShort_events_nodes_extrinsic | null;
}

export interface EventsSMShort_events {
  __typename: "EventsConnection";
  /**
   * The count of *all* `Event` you could get from the connection.
   */
  totalCount: number;
  /**
   * A list of `Event` objects.
   */
  nodes: (EventsSMShort_events_nodes | null)[];
}

export interface EventsSMShort {
  /**
   * Reads and enables pagination through a set of `Event`.
   */
  events: EventsSMShort_events | null;
}

export interface EventsSMShortVariables {
  section: string;
  method: string;
}
