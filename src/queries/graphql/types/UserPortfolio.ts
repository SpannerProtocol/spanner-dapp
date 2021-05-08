/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: UserPortfolio
// ====================================================

export interface UserPortfolio_account {
  __typename: "Account";
  dpos: string | null;
  travelCabins: string | null;
}

export interface UserPortfolio {
  account: UserPortfolio_account | null;
}

export interface UserPortfolioVariables {
  address: string;
}
