/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: CreatedDpoAllArgsOnly
// ====================================================

export interface CreatedDpoAllArgsOnly_events_nodes_extrinsic {
  __typename: "Extrinsic";
  args: string;
}

export interface CreatedDpoAllArgsOnly_events_nodes {
  __typename: "Event";
  data: string;
  /**
   * Reads a single `Extrinsic` that is related to this `Event`.
   */
  extrinsic: CreatedDpoAllArgsOnly_events_nodes_extrinsic | null;
}

export interface CreatedDpoAllArgsOnly_events {
  __typename: "EventsConnection";
  /**
   * The count of *all* `Event` you could get from the connection.
   */
  totalCount: number;
  /**
   * A list of `Event` objects.
   */
  nodes: (CreatedDpoAllArgsOnly_events_nodes | null)[];
}

export interface CreatedDpoAllArgsOnly {
  /**
   * Reads and enables pagination through a set of `Event`.
   */
  events: CreatedDpoAllArgsOnly_events | null;
}
