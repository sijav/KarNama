/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Health = {
  /** Which environment this process believes it is in */
  readonly environment: Scalars['String']['output'];
  /** ok when the service is serving requests */
  readonly status: Scalars['String']['output'];
  /** Seconds since this process started, so a cold start is visible */
  readonly uptimeSeconds: Scalars['Float']['output'];
};

export type Query = {
  /** Whether the API is up, and enough context to tell a cold start from an outage */
  readonly health: Health;
};

export type HealthQueryVariables = Exact<{ [key: string]: never; }>;


export type HealthQuery = { readonly health: { readonly status: string, readonly environment: string, readonly uptimeSeconds: number } };


export const HealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Health"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"health"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"environment"}},{"kind":"Field","name":{"kind":"Name","value":"uptimeSeconds"}}]}}]}}]} as unknown as DocumentNode<HealthQuery, HealthQueryVariables>;