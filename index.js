import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

//Tools
import * as aboutTool from "./tools/about.js";
import * as calculateDistanceTool from "./tools/calculate-distance.js";

console.log("Starting server...");

const app = express();
app.use(express.json());

const mcpServer = new McpServer({
  name: "travel-planner",
  version: "0.1.0",
});

mcpServer.tool("about", aboutTool.schema, aboutTool.handler);
mcpServer.tool(
  "calculate-distance",
  calculateDistanceTool.schema,
  calculateDistanceTool.handler
);

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
  console.log(`[MCP] Server is running on http://localhost:${PORT}`);
});
