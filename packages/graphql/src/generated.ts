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
