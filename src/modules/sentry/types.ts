export type SentryIssueType = 'error' | 'warning';
export type SentryIssueStatus = 'unresolved';
export type SentryIssue = {
  lastSeen: string; // ISO date
  firstSeen: string; // ISO date
  userCount: number;
  title: string;
  id: string; // Number as a string
  type: SentryIssueType;
  status: SentryIssueStatus;
  count: string; // Number as string
  shortId: string; // Human readable string
  isOnLatestRelease: boolean;
  firstRelease: string;
  ticketUrl?: string;
  project: {
    slug: string;
    id: string;
    name: string;
  };
  assignedTo?: {
    id: string;
    email: string;
    name: string;
  }
};

export type SentryRelease = {
  version: string;
  dateCreated: string;
}

export type SentryProject = {
  org: string;
  repo: string;
  authToken: string;
  releasePrefix: string;
  environment?: string;
  ticketHostname?: string;
}

export type SentryCache = {
  releases: {
    version: string;
    created: string;
  }[];
}

export type FetchIssueOptions = {
  formatted?: boolean;
}