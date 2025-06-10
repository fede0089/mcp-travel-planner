import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import * as searchFlightsOffersTool from "./tools/search-flights-offers.js";
import * as searchHotelsOffersTool from "./tools/search-hotels-offers.js";

const isDev = process.env.NODE_ENV === "development";

const logger = {
  info: (...args) => {
    if (isDev) {
      console.log("[INFO]", ...args);
    }
  },
  error: (...args) => {
    if (isDev) {
      console.error("[ERROR]", ...args);
    }
  },
};

logger.info("Starting HTTP server...");

const app = express();
app.use(express.json());

// Middleware para logging de requests
app.use((req, res, next) => {
  logger.info("=== New Request ===");
  logger.info("Method:", req.method);
  logger.info("Path:", req.path);
  logger.info("Body:", JSON.stringify(req.body, null, 2));
  next();
});

const mcpServer = new McpServer({
  name: "travel-planner",
  version: "0.1.0",
});

mcpServer.tool(
  "search-flights-offers",
  searchFlightsOffersTool.schema,
  searchFlightsOffersTool.handler
);

mcpServer.tool(
  "search-hotels-offers",
  searchHotelsOffersTool.schema,
  searchHotelsOffersTool.handler
);

app.use((err, req, res, next) => {
  logger.error("=== Error ===");
  logger.error("Error", {
    message: err.message,
    stack: err.stack,
  });
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
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  res.on("close", () => {
    logger.info("Request closed");
    transport.close();
  });
  await mcpServer.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

const PORT = process.env.PORT ?? 3333;
app.listen(PORT, () => {
  logger.info(`HTTP Server is running on http://localhost:${PORT}`);
});
