/**
 * Web documentation fetcher
 * Fetches official documentation from various sources
 */

export interface LibraryDocResult {
  library: string;
  source: string;
  content: string;
  url: string;
}

/**
 * Documentation sources mapping
 */
const DOC_SOURCES: Record<string, string> = {
  'langgraph': 'https://langchain-ai.github.io/langgraph/',
  'langchain': 'https://python.langchain.com/docs/introduction/',
  'react': 'https://react.dev/learn',
  'nextjs': 'https://nextjs.org/docs',
  'vue': 'https://vuejs.org/guide/introduction.html',
  'fastapi': 'https://fastapi.tiangolo.com/',
  'django': 'https://docs.djangoproject.com/en/stable/',
  'express': 'https://expressjs.com/en/guide/routing.html',
  'pytorch': 'https://pytorch.org/docs/stable/index.html',
  'tensorflow': 'https://www.tensorflow.org/guide',
  'pandas': 'https://pandas.pydata.org/docs/',
  'numpy': 'https://numpy.org/doc/stable/',
  'crewai': 'https://docs.crewai.com/',
};

/**
 * Fetch documentation content from URL
 */
async function fetchUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const html = await response.text();

    // Simple HTML to text conversion
    // Remove script and style tags
    let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // Remove HTML tags
    text = text.replace(/<[^>]+>/g, ' ');

    // Decode HTML entities
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // Clean up whitespace
    text = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');

    return text;
  } catch (error) {
    throw new Error(`Failed to fetch ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Search for library documentation
 */
export async function searchLibraryDocs(library: string, query?: string): Promise<LibraryDocResult> {
  const libraryLower = library.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Check if we have a known documentation source
  const docUrl = DOC_SOURCES[libraryLower];

  if (!docUrl) {
    // Try to construct a likely documentation URL
    const possibleUrls = [
      `https://${libraryLower}.readthedocs.io/`,
      `https://docs.${libraryLower}.com/`,
      `https://${libraryLower}.org/docs/`,
      `https://github.com/${libraryLower}/${libraryLower}`,
    ];

    throw new Error(
      `Documentation source not found for "${library}". ` +
      `Tried: ${possibleUrls.join(', ')}. ` +
      `You can add it manually to CHECK-MODULE.`
    );
  }

  // Fetch the documentation
  const content = await fetchUrl(docUrl);

  // If query is provided, try to filter relevant content
  let filteredContent = content;
  if (query) {
    const queryLower = query.toLowerCase();
    const lines = content.split('\n');
    const relevantLines: string[] = [];

    // Find lines containing the query or nearby lines
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(queryLower)) {
        // Include context: 3 lines before and 10 lines after
        const start = Math.max(0, i - 3);
        const end = Math.min(lines.length, i + 10);
        relevantLines.push(...lines.slice(start, end));
        i = end; // Skip ahead
      }
    }

    if (relevantLines.length > 0) {
      filteredContent = relevantLines.join('\n');
    }
  }

  // Limit content length
  const MAX_LENGTH = 5000;
  if (filteredContent.length > MAX_LENGTH) {
    filteredContent = filteredContent.substring(0, MAX_LENGTH) + '\n\n... (content truncated)';
  }

  return {
    library,
    source: docUrl,
    content: filteredContent,
    url: docUrl,
  };
}

/**
 * Add a custom documentation source
 */
export function addDocSource(library: string, url: string): void {
  const libraryLower = library.toLowerCase().replace(/[^a-z0-9]/g, '');
  DOC_SOURCES[libraryLower] = url;
}

/**
 * Get all available library sources
 */
export function getAvailableLibraries(): string[] {
  return Object.keys(DOC_SOURCES).sort();
}
