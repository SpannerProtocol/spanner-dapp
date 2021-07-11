/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { EventsOrderBy } from "./../../../types/globalTypes";

// ====================================================
// GraphQL query operation: EventsByIds
// ====================================================

export interface EventsByIds_events_nodes_extrinsic_events_nodes {
  __typename: "Event";
  section: string;
  method: string;
  data: string;
}

export interface EventsByIds_events_nodes_extrinsic_events {
  __typename: "EventsConnection";
  /**
   * A list of `Event` objects.
   */
  nodes: (EventsByIds_events_nodes_extrinsic_events_nodes | null)[];
}

export interface EventsByIds_events_nodes_extrinsic {
  __typename: "Extrinsic";
  timestamp: any;
  method: string;
  section: string;
  args: string;
  /**
   * Reads and enables pagination through a set of `Event`.
   */
  events: EventsByIds_events_nodes_extrinsic_events;
}

export interface EventsByIds_events_nodes {
  __typename: "Event";
  id: string;
  section: string;
  method: string;
  data: string;
  /**
   * Reads a single `Extrinsic` that is related to this `Event`.
   */
  extrinsic: EventsByIds_events_nodes_extrinsic | null;
}

export interface EventsByIds_events {
  __typename: "EventsConnection";
  /**
   * The count of *all* `Event` you could get from the connection.
   */
  totalCount: number;
  /**
   * A list of `Event` objects.
   */
  nodes: (EventsByIds_events_nodes | null)[];
}

export interface EventsByIds {
  /**
   * Reads and enables pagination through a set of `Event`.
   */
  events: EventsByIds_events | null;
}

export interface EventsByIdsVariables {
  eventIds?: string[] | null;
  first: number;
  offset: number;
  orderBy?: EventsOrderBy[] | null;
}
