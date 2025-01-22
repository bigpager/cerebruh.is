export interface Context {
source: string;
timestamp: number;
revisionReason?: string;
revisedAt?: number;
}

export interface Memory {
id: string;
type: string;
content: string;
context: Context;
}

export interface RevisionRequest {
revision: string;
reason: string;
}

