#!/usr/bin/env node

// MCPサーバーの動作確認スクリプト
import { spawn } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('Moodle MCP Server Test Script');
console.log('==============================\n');

// 環境変数のチェック
if (!process.env.MOODLE_SITE_URL || !process.env.MOODLE_WS_TOKEN) {
    console.error('Error: MOODLE_SITE_URL and MOODLE_WS_TOKEN must be set in environment variables');
    console.log('\nExample:');
    console.log('export MOODLE_SITE_URL=https://your-moodle-site.com');
    console.log('export MOODLE_WS_TOKEN=your-webservice-token');
    process.exit(1);
}

console.log('Starting MCP server...\n');

const server = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'inherit'],
    env: process.env
});

// MCPプロトコルでツール一覧を要求
const listToolsRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
};

server.stdout.on('data', (data) => {
    try {
        const lines = data.toString().split('\n').filter(line => line.trim());
        lines.forEach(line => {
            try {
                const response = JSON.parse(line);
                if (response.id === 1) {
                    console.log('Available tools:');
                    response.result.tools.forEach(tool => {
                        console.log(`- ${tool.name}: ${tool.description}`);
                    });
                    console.log('\nMCP server is running successfully!');
                    console.log('Press Ctrl+C to exit.');
                }
            } catch (e) {
                // JSONでない行は無視
            }
        });
    } catch (error) {
        console.error('Error parsing response:', error);
    }
});

// ツール一覧を要求
setTimeout(() => {
    server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
}, 1000);

// 終了処理
process.on('SIGINT', () => {
    console.log('\nShutting down...');
    server.kill();
    process.exit(0);
}); 