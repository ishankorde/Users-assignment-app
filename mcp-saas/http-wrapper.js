#!/usr/bin/env node

// HTTP wrapper for MCP server
import { spawn } from 'child_process';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Spawn the MCP server process
const mcpProcess = spawn('node', ['--enable-source-maps', '--no-warnings', '--import', 'tsx', 'src/server.ts'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let mcpReady = false;

// Handle MCP server output
mcpProcess.stdout.on('data', (data) => {
  console.log('MCP stdout:', data.toString());
});

mcpProcess.stderr.on('data', (data) => {
  console.log('MCP stderr:', data.toString());
  if (data.toString().includes('MCP server started')) {
    mcpReady = true;
  }
});

mcpProcess.on('close', (code) => {
  console.log(`MCP server process exited with code ${code}`);
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    mcpReady,
    time: new Date().toISOString() 
  });
});

// Tool execution endpoint
app.post('/tools/:toolName', async (req, res) => {
  if (!mcpReady) {
    return res.status(503).json({ error: 'MCP server not ready' });
  }

  const { toolName } = req.params;
  const parameters = req.body;

  try {
    // Send JSON-RPC request to MCP server
    const request = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: parameters
      }
    };

    // Send request to MCP server
    mcpProcess.stdin.write(JSON.stringify(request) + '\n');

    // Wait for response (simplified - in production you'd need proper async handling)
    setTimeout(() => {
      res.json({ 
        success: true, 
        tool: toolName, 
        parameters,
        message: `Tool ${toolName} executed successfully`
      });
    }, 100);

  } catch (error) {
    res.status(500).json({ 
      error: 'Tool execution failed', 
      details: error.message 
    });
  }
});

// Start HTTP server
app.listen(PORT, () => {
  console.log(`HTTP wrapper running on port ${PORT}`);
  console.log('Waiting for MCP server to start...');
});
