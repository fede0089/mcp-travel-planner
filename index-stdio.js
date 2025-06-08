import dotenv from "dotenv";
dotenv.config();

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

//Tools
import * as searchFlightsTool from "./tools/search-flights.js";

const mcpServer = new McpServer({
  name: "travel-planner",
  version: "0.1.0",
});

// Registrar herramientas
mcpServer.tool(
  "search-flights",
  searchFlightsTool.schema,
  searchFlightsTool.handler
);

async function startServer() {
  try {
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
  } catch (error) {
    console.error("Error starting STDIO server:", error);
    process.exit(1);
  }
}

startServer();
