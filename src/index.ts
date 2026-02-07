#!/usr/bin/env node

/**
 * CHECK-MODULE MCP Server
 * Provides tools and resources for accessing internal documentation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { DocumentationStore } from './docStore.js';
import { searchLibraryDocs, getAvailableLibraries } from './webFetcher.js';

// Initialize documentation store
const docStore = new DocumentationStore();

// Create MCP server
const server = new Server(
  {
    name: 'CHECK-MODULE',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

/**
 * List all available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search-docs',
        description: 'Search through internal documentation. Returns relevant documents based on query, category, and tags.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query to find relevant documentation',
            },
            category: {
              type: 'string',
              description: 'Optional: Filter by category (API, Database, DevOps, etc.)',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional: Filter by tags',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (default: 10)',
              default: 10,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get-doc',
        description: 'Get full documentation by ID. Returns the complete content of a specific document.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Document ID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'list-categories',
        description: 'List all available documentation categories.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'add-doc',
        description: 'Add or update documentation. Stores a new document or updates an existing one.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique document ID',
            },
            title: {
              type: 'string',
              description: 'Document title',
            },
            description: {
              type: 'string',
              description: 'Short description',
            },
            content: {
              type: 'string',
              description: 'Full document content (supports Markdown)',
            },
            category: {
              type: 'string',
              description: 'Category (e.g., API, Database, DevOps)',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tags for categorization',
            },
            version: {
              type: 'string',
              description: 'Optional: Document version',
            },
          },
          required: ['id', 'title', 'description', 'content', 'category', 'tags'],
        },
      },
      {
        name: 'fetch-library-docs',
        description: 'Fetch official documentation from online sources for libraries and frameworks (LangGraph, React, FastAPI, etc.). Automatically retrieves up-to-date documentation from the web.',
        inputSchema: {
          type: 'object',
          properties: {
            library: {
              type: 'string',
              description: 'Name of the library/framework (e.g., "LangGraph", "React", "FastAPI")',
            },
            query: {
              type: 'string',
              description: 'Optional: Specific topic to search for in the documentation (e.g., "create agent", "routing")',
            },
          },
          required: ['library'],
        },
      },
      {
        name: 'list-available-libraries',
        description: 'List all libraries that have known documentation sources configured.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    return {
      content: [{ type: 'text', text: 'Missing arguments' }],
      isError: true,
    };
  }

  try {
    switch (name) {
      case 'search-docs': {
        const searchOptions = {
          query: args.query as string,
          category: args.category as string | undefined,
          tags: args.tags as string[] | undefined,
          limit: (args.limit as number) || 10,
        };

        const results = docStore.search(searchOptions);

        if (results.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `No documentation found for query: "${searchOptions.query}"`,
              },
            ],
          };
        }

        const resultText = results
          .map(
            (result, index) =>
              `${index + 1}. **${result.doc.title}** (ID: ${result.doc.id})
   Category: ${result.doc.category} | Tags: ${result.doc.tags.join(', ')}
   ${result.doc.description}

   Excerpt: ${result.excerpt}
   ---`
          )
          .join('\n\n');

        return {
          content: [
            {
              type: 'text',
              text: `Found ${results.length} result(s):\n\n${resultText}`,
            },
          ],
        };
      }

      case 'get-doc': {
        const docId = args.id as string;
        const doc = docStore.getDocById(docId);

        if (!doc) {
          return {
            content: [
              {
                type: 'text',
                text: `Document not found: ${docId}`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: `# ${doc.title}

**Category:** ${doc.category}
**Tags:** ${doc.tags.join(', ')}
**Version:** ${doc.version || 'N/A'}
**Last Updated:** ${doc.lastUpdated.toISOString()}

---

${doc.content}`,
            },
          ],
        };
      }

      case 'list-categories': {
        const categories = docStore.getCategories();
        return {
          content: [
            {
              type: 'text',
              text: `Available categories:\n${categories.map((cat, i) => `${i + 1}. ${cat}`).join('\n')}`,
            },
          ],
        };
      }

      case 'add-doc': {
        const docEntry = {
          id: args.id as string,
          title: args.title as string,
          description: args.description as string,
          content: args.content as string,
          category: args.category as string,
          tags: args.tags as string[],
          version: args.version as string | undefined,
          lastUpdated: new Date(),
        };

        docStore.addDoc(docEntry);

        return {
          content: [
            {
              type: 'text',
              text: `Documentation "${docEntry.title}" (ID: ${docEntry.id}) has been added/updated successfully.`,
            },
          ],
        };
      }

      case 'fetch-library-docs': {
        const library = args.library as string;
        const query = args.query as string | undefined;

        try {
          const result = await searchLibraryDocs(library, query);

          return {
            content: [
              {
                type: 'text',
                text: `# ${result.library} Documentation

**Source:** ${result.source}

${query ? `**Search Query:** ${query}\n\n` : ''}---

${result.content}

---

**Full documentation:** ${result.url}`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error fetching documentation for "${library}": ${error instanceof Error ? error.message : String(error)}

**Available libraries:** ${getAvailableLibraries().join(', ')}

You can add custom libraries using the add-doc tool or by modifying the webFetcher.ts file.`,
              },
            ],
            isError: true,
          };
        }
      }

      case 'list-available-libraries': {
        const libraries = getAvailableLibraries();
        return {
          content: [
            {
              type: 'text',
              text: `Libraries with known documentation sources (${libraries.length}):\n\n${libraries.map((lib, i) => `${i + 1}. ${lib}`).join('\n')}\n\nYou can fetch documentation for any of these using the fetch-library-docs tool.`,
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error executing tool: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * List all available resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const metadata = docStore.getDocMetadata();

  return {
    resources: metadata.map((doc) => ({
      uri: `doc://internal/${doc.id}`,
      name: doc.title,
      description: doc.description,
      mimeType: 'text/markdown',
    })),
  };
});

/**
 * Read a specific resource
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  // Parse URI: doc://internal/{id}
  const match = uri.match(/^doc:\/\/internal\/(.+)$/);
  if (!match) {
    throw new Error(`Invalid resource URI: ${uri}`);
  }

  const docId = match[1];
  const doc = docStore.getDocById(docId);

  if (!doc) {
    throw new Error(`Document not found: ${docId}`);
  }

  return {
    contents: [
      {
        uri,
        mimeType: 'text/markdown',
        text: `# ${doc.title}

**Category:** ${doc.category}
**Tags:** ${doc.tags.join(', ')}
**Version:** ${doc.version || 'N/A'}
**Description:** ${doc.description}

---

${doc.content}`,
      },
    ],
  };
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('CHECK-MODULE MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
