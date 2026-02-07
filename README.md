# CHECK-MODULE MCP Server

> A powerful Model Context Protocol (MCP) server for managing internal documentation and fetching official library documentation from the web.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-18+-green)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-1.26-purple)](https://modelcontextprotocol.io)

## 🎥 Demo

https://github.com/user-attachments/assets/fa1d8f1a-82db-4fa8-a30b-c82ce7d4f01d

> Watch CHECK-MODULE in action: fetching documentation, searching internal docs, and managing custom documentation with Claude Desktop.

## 🎯 Features

- **📚 Internal Documentation Management** - Store, search, and manage your custom documentation
- **🌐 Web Documentation Fetching** - Automatically fetch official documentation from 13+ popular libraries
- **🔍 Smart Search** - Relevance-based search with category and tag filtering
- **📝 Markdown Support** - Full Markdown formatting for documentation
- **🔧 MCP Tools** - 6 powerful tools exposed via Model Context Protocol
- **📦 Resources** - URI-based access to documentation (`doc://internal/*`)

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/CHECK-FUNC-MCP.git
cd CHECK-FUNC-MCP

# Install dependencies
npm install

# Build the project
npm run build
```

## ⚙️ Configuration

Add to your Claude Desktop config file (`claude_desktop_config.json`):

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**macOS/Linux:** `~/.claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "CHECK-MODULE": {
      "command": "node",
      "args": [
        "/absolute/path/to/CHECK-FUNC-MCP/dist/index.js"
      ]
    }
  }
}
```

Then restart Claude Desktop completely.

## 🚀 Usage

### Internal Documentation Tools

#### `search-docs` - Search your internal documentation
```
Search for "authentication" in the documentation
```

#### `get-doc` - Get a complete document by ID
```
Show me the Authentication API guide
```

#### `list-categories` - List all documentation categories
```
What documentation categories are available?
```

#### `add-doc` - Add or update documentation
```
Add documentation about Redis caching with ID "redis-cache"
```

### Web Documentation Fetching

#### `fetch-library-docs` - Fetch official documentation from the web
```
Use CHECK-MODULE to fetch LangGraph documentation about creating agents
```

#### `list-available-libraries` - Show supported libraries
```
What libraries can CHECK-MODULE fetch documentation for?
```

## 📚 Supported Libraries

CHECK-MODULE can automatically fetch documentation for:

- **AI/ML:** LangGraph, LangChain, PyTorch, TensorFlow, CrewAI
- **Web Frameworks:** React, Next.js, Vue, Express, FastAPI, Django
- **Data Science:** Pandas, NumPy

## 🛠️ Available Tools

| Tool | Description |
|------|-------------|
| `search-docs` | Search internal documentation with filters |
| `get-doc` | Retrieve full document by ID |
| `list-categories` | List all documentation categories |
| `add-doc` | Add or update documentation |
| `fetch-library-docs` | Fetch official docs from the web |
| `list-available-libraries` | Show supported libraries |

## 🏗️ Project Structure

```
CHECK-FUNC-MCP/
├── src/
│   ├── index.ts          # Main MCP server
│   ├── docStore.ts       # Documentation storage
│   ├── webFetcher.ts     # Web documentation fetcher
│   └── types.ts          # TypeScript type definitions
├── dist/                 # Compiled JavaScript (generated)
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode (auto-rebuild)
npm run watch

# Run manually (for testing)
npm start
```

## 📖 Examples

### Example 1: Search Internal Docs
```
User: Search for "deployment" in DevOps category
Claude: [Uses search-docs tool]
Found 1 result: Deployment Guide with Docker/Kubernetes instructions
```

### Example 2: Fetch Web Documentation
```
User: How do I create an agent in LangGraph?
Claude: [Uses fetch-library-docs tool]
Fetches from https://langchain-ai.github.io/langgraph/
Returns: Step-by-step guide with code examples
```

### Example 3: Add Custom Documentation
```
User: Add docs about our Redis caching strategy
Claude: [Uses add-doc tool]
Documentation stored with ID "redis-cache"
```

## 🎨 Customization

### Adding More Libraries

Edit `src/webFetcher.ts` to add custom documentation sources:

```typescript
const DOC_SOURCES: Record<string, string> = {
  'your-library': 'https://docs.your-library.com/',
  // ... existing libraries
};
```

Then rebuild: `npm run build`

### Pre-loading Documentation

Edit `src/docStore.ts` in the `initializeSampleDocs()` method to add your initial documentation.

## 🐛 Troubleshooting

### Server not starting
```bash
# Test the build
npm run build

# Run directly
node dist/index.js
# Should output: "CHECK-MODULE MCP Server running on stdio"
```

### Claude doesn't see the tools
1. Check that the path in `claude_desktop_config.json` is absolute
2. Restart Claude Desktop completely
3. Check developer console (`Ctrl+Shift+I`) for errors

### Web fetching not working
- Ensure you have internet connection
- Check if the library is in the supported list
- The library name must match exactly (case-insensitive)

## 📝 Pre-loaded Documentation

The server comes with 3 example documents:

1. **Authentication API** (`api-auth`) - JWT authentication guide
2. **Database Schema** (`db-schema`) - PostgreSQL schema reference
3. **Deployment Guide** (`deploy-guide`) - Docker/Kubernetes deployment

## 🔮 Roadmap

- [ ] Add more library documentation sources
- [ ] Implement persistent storage (SQLite/PostgreSQL)
- [ ] Add version history tracking
- [ ] Support for custom authentication
- [ ] REST API for external management
- [ ] Import from Markdown files
- [ ] Export documentation to various formats

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)
- Inspired by [Context7](https://context7.com)
- Uses [Zod](https://zod.dev) for schema validation

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/CHECK-FUNC-MCP/issues)
- **Documentation:** [MCP Documentation](https://modelcontextprotocol.io)

---

**Made with ❤️ using TypeScript and MCP**
