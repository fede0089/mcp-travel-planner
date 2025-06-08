import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

//Tools
import * as searchFlightsOffersTool from "./tools/search-flights-offers.js";
import * as listHotelsByCityTool from "./tools/list-hotels-by-city.js";
import * as searchHotelsOffersTool from "./tools/search-hotels-offers.js";

console.log("Starting HTTP server...");

const app = express();
app.use(express.json());

const mcpServer = new McpServer({
  name: "travel-planner",
  version: "0.1.0",
});

// Registrar herramientas
mcpServer.tool(
  "search-flights-offers",
  searchFlightsOffersTool.schema,
  searchFlightsOffersTool.handler
);

mcpServer.tool(
  "list-hotels-by-city",
  listHotelsByCityTool.schema,
  listHotelsByCityTool.handler
);

mcpServer.tool(
  "search-hotels-offers",
  searchHotelsOffersTool.schema,
  searchHotelsOffersTool.handler
);

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error("Error en el servidor:", err);
  if (!res.headersSent) {
    res.status(500).json({
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: "Internal server error",
      },
      id: null,
    });
  }
});

app.post("/mcp", async (req, res) => {
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      console.log("Request closed");
      transport.close();
    });

    await mcpServer.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

const PORT = process.env.PORT ?? 3333;
app.listen(PORT, () => {
  console.log(`[MCP] HTTP Server is running on http://localhost:${PORT}`);
});
