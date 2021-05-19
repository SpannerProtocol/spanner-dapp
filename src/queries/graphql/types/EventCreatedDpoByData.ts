/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: EventCreatedDpoByData
// ====================================================

export interface EventCreatedDpoByData_events_nodes_extrinsic {
  __typename: "Extrinsic";
  method: string;
  section: string;
  args: string;
}

export interface EventCreatedDpoByData_events_nodes {
  __typename: "Event";
  id: string;
  section: string;
  method: string;
  data: string;
  /**
   * Reads a single `Extrinsic` that is related to this `Event`.
   */
  extrinsic: EventCreatedDpoByData_events_nodes_extrinsic | null;
}

export interface EventCreatedDpoByData_events {
  __typename: "EventsConnection";
  /**
   * The count of *all* `Event` you could get from the connection.
   */
  totalCount: number;
  /**
   * A list of `Event` objects.
   */
  nodes: (EventCreatedDpoByData_events_nodes | null)[];
}

export interface EventCreatedDpoByData {
  /**
   * Reads and enables pagination through a set of `Event`.
   */
  events: EventCreatedDpoByData_events | null;
}

export interface EventCreatedDpoByDataVariables {
  first: number;
  offset: number;
  endsWith: string;
}
