/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: CreatedDpoByData
// ====================================================

export interface CreatedDpoByData_events_nodes_extrinsic {
  __typename: "Extrinsic";
  method: string;
  section: string;
  args: string;
}

export interface CreatedDpoByData_events_nodes {
  __typename: "Event";
  id: string;
  section: string;
  method: string;
  data: string;
  /**
   * Reads a single `Extrinsic` that is related to this `Event`.
   */
  extrinsic: CreatedDpoByData_events_nodes_extrinsic | null;
}

export interface CreatedDpoByData_events {
  __typename: "EventsConnection";
  /**
   * The count of *all* `Event` you could get from the connection.
   */
  totalCount: number;
  /**
   * A list of `Event` objects.
   */
  nodes: (CreatedDpoByData_events_nodes | null)[];
}

export interface CreatedDpoByData {
  /**
   * Reads and enables pagination through a set of `Event`.
   */
  events: CreatedDpoByData_events | null;
}

export interface CreatedDpoByDataVariables {
  first: number;
  offset: number;
  includes: string;
}
