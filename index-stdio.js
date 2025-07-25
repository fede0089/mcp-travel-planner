import dotenv from "dotenv";
dotenv.config();

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

//Tools
import * as searchFlightsOffersTool from "./tools/search-flights-offers.js";
import * as searchHotelsOffersTool from "./tools/search-hotels-offers.js";

const mcpServer = new McpServer({
  name: "travel-planner",
  version: "0.1.0",
});

mcpServer.tool(
  searchFlightsOffersTool.name,
  searchFlightsOffersTool.description,
  searchFlightsOffersTool.schema,
  searchFlightsOffersTool.handler
);

mcpServer.tool(
  searchHotelsOffersTool.name,
  searchHotelsOffersTool.description,
  searchHotelsOffersTool.schema,
  searchHotelsOffersTool.handler
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
