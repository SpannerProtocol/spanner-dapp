/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: UserCreatedDpo
// ====================================================

export interface UserCreatedDpo_events_nodes_extrinsic {
  __typename: "Extrinsic";
  args: string;
}

export interface UserCreatedDpo_events_nodes {
  __typename: "Event";
  data: string;
  /**
   * Reads a single `Extrinsic` that is related to this `Event`.
   */
  extrinsic: UserCreatedDpo_events_nodes_extrinsic | null;
}

export interface UserCreatedDpo_events {
  __typename: "EventsConnection";
  /**
   * The count of *all* `Event` you could get from the connection.
   */
  totalCount: number;
  /**
   * A list of `Event` objects.
   */
  nodes: (UserCreatedDpo_events_nodes | null)[];
}

export interface UserCreatedDpo {
  /**
   * Reads and enables pagination through a set of `Event`.
   */
  events: UserCreatedDpo_events | null;
}

export interface UserCreatedDpoVariables {
  address: string;
}
