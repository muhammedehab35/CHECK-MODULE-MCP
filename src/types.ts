/**
 * Types for the custom documentation MCP server
 */

export interface DocEntry {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  lastUpdated: Date;
  version?: string;
}

export interface DocMetadata {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  version?: string;
}

export interface SearchOptions {
  query: string;
  category?: string;
  tags?: string[];
  limit?: number;
}

export interface SearchResult {
  doc: DocEntry;
  score: number;
  excerpt: string;
}
