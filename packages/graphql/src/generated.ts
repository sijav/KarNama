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

export type Account = {
  readonly id: Scalars['String']['output'];
  readonly name: Scalars['String']['output'];
  readonly phone: Scalars['String']['output'];
  readonly since: Scalars['String']['output'];
};

export type CodeDelivery = {
  readonly expiresInSeconds: Scalars['Int']['output'];
  readonly phone: Scalars['String']['output'];
  readonly retryAfterSeconds: Scalars['Int']['output'];
};

export type ExtractedJob = {
  readonly company: Scalars['String']['output'];
  readonly description: Scalars['String']['output'];
  readonly employmentTypes: ReadonlyArray<Scalars['String']['output']>;
  readonly experience: Scalars['String']['output'];
  readonly expiresAt: Scalars['String']['output'];
  readonly jobLevel?: Maybe<Scalars['String']['output']>;
  readonly location: Scalars['String']['output'];
  readonly postedAt: Scalars['String']['output'];
  readonly postingUrl: Scalars['String']['output'];
  readonly salary: Scalars['String']['output'];
  readonly source: Scalars['String']['output'];
  readonly title: Scalars['String']['output'];
};

export type Health = {
  /** Whether this process allows rate-limited demo extraction */
  readonly demoExtractionEnabled: Scalars['Boolean']['output'];
  /** Which environment this process believes it is in */
  readonly environment: Scalars['String']['output'];
  /** Configured extraction provider, without credentials */
  readonly extractionProvider: Scalars['String']['output'];
  /** Git revision running on Render, when available */
  readonly revision?: Maybe<Scalars['String']['output']>;
  /** ok when the service is serving requests */
  readonly status: Scalars['String']['output'];
  /** Seconds since this process started, so a cold start is visible */
  readonly uptimeSeconds: Scalars['Float']['output'];
};

export type LoginResult = {
  readonly account: Account;
  readonly expiresAt: Scalars['String']['output'];
  readonly token: Scalars['String']['output'];
};

export type Mutation = {
  readonly extractJob: ExtractedJob;
  readonly requestLoginCode: CodeDelivery;
  readonly saveAccountName: Account;
  readonly signOut: Scalars['Boolean']['output'];
  readonly verifyLoginCode: LoginResult;
};


export type MutationExtractJobArgs = {
  source: Scalars['String']['input'];
};


export type MutationRequestLoginCodeArgs = {
  phone: Scalars['String']['input'];
};


export type MutationSaveAccountNameArgs = {
  name: Scalars['String']['input'];
};


export type MutationVerifyLoginCodeArgs = {
  code: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};

export type Query = {
  readonly currentAccount: Account;
  /** Whether the API is up, and enough context to tell a cold start from an outage */
  readonly health: Health;
};

export type RequestLoginCodeMutationVariables = Exact<{
  phone: string;
}>;


export type RequestLoginCodeMutation = { readonly requestLoginCode: { readonly phone: string, readonly retryAfterSeconds: number, readonly expiresInSeconds: number } };

export type VerifyLoginCodeMutationVariables = Exact<{
  phone: string;
  code: string;
}>;


export type VerifyLoginCodeMutation = { readonly verifyLoginCode: { readonly token: string, readonly expiresAt: string, readonly account: { readonly id: string, readonly phone: string, readonly name: string, readonly since: string } } };

export type CurrentAccountQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentAccountQuery = { readonly currentAccount: { readonly id: string, readonly phone: string, readonly name: string, readonly since: string } };

export type SaveAccountNameMutationVariables = Exact<{
  name: string;
}>;


export type SaveAccountNameMutation = { readonly saveAccountName: { readonly id: string, readonly phone: string, readonly name: string, readonly since: string } };

export type SignOutMutationVariables = Exact<{ [key: string]: never; }>;


export type SignOutMutation = { readonly signOut: boolean };

export type ExtractJobMutationVariables = Exact<{
  source: string;
}>;


export type ExtractJobMutation = { readonly extractJob: { readonly title: string, readonly company: string, readonly employmentTypes: ReadonlyArray<string>, readonly location: string, readonly experience: string, readonly jobLevel: string | null, readonly postedAt: string, readonly salary: string, readonly source: string, readonly expiresAt: string, readonly postingUrl: string, readonly description: string } };

export type HealthQueryVariables = Exact<{ [key: string]: never; }>;


export type HealthQuery = { readonly health: { readonly status: string, readonly environment: string, readonly uptimeSeconds: number } };


export const RequestLoginCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RequestLoginCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"phone"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestLoginCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"phone"},"value":{"kind":"Variable","name":{"kind":"Name","value":"phone"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"retryAfterSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"expiresInSeconds"}}]}}]}}]} as unknown as DocumentNode<RequestLoginCodeMutation, RequestLoginCodeMutationVariables>;
export const VerifyLoginCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyLoginCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"phone"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"code"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyLoginCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"phone"},"value":{"kind":"Variable","name":{"kind":"Name","value":"phone"}}},{"kind":"Argument","name":{"kind":"Name","value":"code"},"value":{"kind":"Variable","name":{"kind":"Name","value":"code"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"since"}}]}}]}}]}}]} as unknown as DocumentNode<VerifyLoginCodeMutation, VerifyLoginCodeMutationVariables>;
export const CurrentAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CurrentAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"since"}}]}}]}}]} as unknown as DocumentNode<CurrentAccountQuery, CurrentAccountQueryVariables>;
export const SaveAccountNameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveAccountName"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveAccountName"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"since"}}]}}]}}]} as unknown as DocumentNode<SaveAccountNameMutation, SaveAccountNameMutationVariables>;
export const SignOutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SignOut"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"signOut"}}]}}]} as unknown as DocumentNode<SignOutMutation, SignOutMutationVariables>;
export const ExtractJobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ExtractJob"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"source"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"extractJob"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"source"},"value":{"kind":"Variable","name":{"kind":"Name","value":"source"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"company"}},{"kind":"Field","name":{"kind":"Name","value":"employmentTypes"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"experience"}},{"kind":"Field","name":{"kind":"Name","value":"jobLevel"}},{"kind":"Field","name":{"kind":"Name","value":"postedAt"}},{"kind":"Field","name":{"kind":"Name","value":"salary"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"postingUrl"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<ExtractJobMutation, ExtractJobMutationVariables>;
export const HealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Health"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"health"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"environment"}},{"kind":"Field","name":{"kind":"Name","value":"uptimeSeconds"}}]}}]}}]} as unknown as DocumentNode<HealthQuery, HealthQueryVariables>;