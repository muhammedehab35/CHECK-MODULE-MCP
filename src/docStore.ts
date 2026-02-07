/**
 * Documentation storage and retrieval system
 */

import { DocEntry, DocMetadata, SearchOptions, SearchResult } from './types.js';

export class DocumentationStore {
  private docs: Map<string, DocEntry> = new Map();

  constructor() {
    this.initializeSampleDocs();
  }

  /**
   * Initialize with sample documentation
   */
  private initializeSampleDocs(): void {
    const sampleDocs: DocEntry[] = [
      {
        id: 'api-auth',
        title: 'Authentication API',
        description: 'How to authenticate with our internal API',
        content: `# Authentication API

## Overview
Our API uses JWT tokens for authentication.

## Getting Started
1. Obtain credentials from the admin panel
2. Make a POST request to /api/auth/login
3. Include the token in subsequent requests

## Example
\`\`\`javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});
const { token } = await response.json();
\`\`\`

## Token Usage
Include the token in the Authorization header:
\`\`\`
Authorization: Bearer <your-token>
\`\`\``,
        category: 'API',
        tags: ['authentication', 'security', 'jwt'],
        lastUpdated: new Date(),
        version: '2.0'
      },
      {
        id: 'db-schema',
        title: 'Database Schema',
        description: 'Internal database schema documentation',
        content: `# Database Schema

## Users Table
- id (UUID, primary key)
- email (VARCHAR, unique)
- password_hash (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## Posts Table
- id (UUID, primary key)
- user_id (UUID, foreign key)
- title (VARCHAR)
- content (TEXT)
- published (BOOLEAN)
- created_at (TIMESTAMP)

## Relationships
- One user can have many posts
- Posts belong to one user`,
        category: 'Database',
        tags: ['schema', 'postgresql', 'database'],
        lastUpdated: new Date(),
        version: '1.5'
      },
      {
        id: 'deploy-guide',
        title: 'Deployment Guide',
        description: 'How to deploy our applications',
        content: `# Deployment Guide

## Prerequisites
- Docker installed
- Access to production servers
- Environment variables configured

## Steps
1. Build the Docker image
   \`\`\`bash
   docker build -t myapp:latest .
   \`\`\`

2. Tag for registry
   \`\`\`bash
   docker tag myapp:latest registry.company.com/myapp:latest
   \`\`\`

3. Push to registry
   \`\`\`bash
   docker push registry.company.com/myapp:latest
   \`\`\`

4. Deploy to production
   \`\`\`bash
   kubectl apply -f deployment.yaml
   \`\`\`

## Rollback
If something goes wrong:
\`\`\`bash
kubectl rollout undo deployment/myapp
\`\`\``,
        category: 'DevOps',
        tags: ['deployment', 'docker', 'kubernetes'],
        lastUpdated: new Date(),
        version: '3.0'
      }
    ];

    sampleDocs.forEach(doc => this.docs.set(doc.id, doc));
  }

  /**
   * Get all documentation entries
   */
  getAllDocs(): DocEntry[] {
    return Array.from(this.docs.values());
  }

  /**
   * Get documentation by ID
   */
  getDocById(id: string): DocEntry | undefined {
    return this.docs.get(id);
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    this.docs.forEach(doc => categories.add(doc.category));
    return Array.from(categories);
  }

  /**
   * Get all documentation metadata (without full content)
   */
  getDocMetadata(): DocMetadata[] {
    return Array.from(this.docs.values()).map(doc => ({
      id: doc.id,
      title: doc.title,
      description: doc.description,
      category: doc.category,
      tags: doc.tags,
      version: doc.version
    }));
  }

  /**
   * Search documentation
   */
  search(options: SearchOptions): SearchResult[] {
    const { query, category, tags, limit = 10 } = options;
    const results: SearchResult[] = [];

    this.docs.forEach(doc => {
      // Filter by category if specified
      if (category && doc.category !== category) {
        return;
      }

      // Filter by tags if specified
      if (tags && tags.length > 0) {
        const hasMatchingTag = tags.some(tag => doc.tags.includes(tag));
        if (!hasMatchingTag) {
          return;
        }
      }

      // Calculate relevance score
      let score = 0;
      const queryLower = query.toLowerCase();

      // Search in title (highest weight)
      if (doc.title.toLowerCase().includes(queryLower)) {
        score += 10;
      }

      // Search in description
      if (doc.description.toLowerCase().includes(queryLower)) {
        score += 5;
      }

      // Search in content
      if (doc.content.toLowerCase().includes(queryLower)) {
        score += 2;
      }

      // Search in tags
      if (doc.tags.some(tag => tag.toLowerCase().includes(queryLower))) {
        score += 3;
      }

      if (score > 0) {
        // Create excerpt
        const contentLower = doc.content.toLowerCase();
        const queryIndex = contentLower.indexOf(queryLower);
        let excerpt = doc.description;

        if (queryIndex !== -1) {
          const start = Math.max(0, queryIndex - 50);
          const end = Math.min(doc.content.length, queryIndex + 150);
          excerpt = '...' + doc.content.slice(start, end) + '...';
        }

        results.push({ doc, score, excerpt });
      }
    });

    // Sort by score descending and limit results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Add or update documentation
   */
  addDoc(doc: DocEntry): void {
    doc.lastUpdated = new Date();
    this.docs.set(doc.id, doc);
  }

  /**
   * Delete documentation
   */
  deleteDoc(id: string): boolean {
    return this.docs.delete(id);
  }
}
