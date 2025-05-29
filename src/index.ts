#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import dotenv from 'dotenv';
import { MoodleClient } from './services/moodleClient.js';
import { ExtendedHandlers } from './handlers/extendedHandlers.js';
import { AnalyticsHandlers } from './handlers/analyticsHandlers.js';

// 環境変数を読み込む
dotenv.config();

// 環境変数の検証
const config = {
  moodleSiteUrl: process.env.MOODLE_SITE_URL || '',
  moodleWsToken: process.env.MOODLE_WS_TOKEN || '',
  logLevel: process.env.LOG_LEVEL || 'info',
};

if (!config.moodleSiteUrl || !config.moodleWsToken) {
  console.error('Error: MOODLE_SITE_URL and MOODLE_WS_TOKEN must be set in environment variables');
  process.exit(1);
}

// Moodleクライアントとハンドラーの初期化
const moodleClient = new MoodleClient(config.moodleSiteUrl, config.moodleWsToken);
const extendedHandlers = new ExtendedHandlers(moodleClient);
const analyticsHandlers = new AnalyticsHandlers(moodleClient);

// MCPサーバーの初期化
const server = new Server(
  {
    name: 'moodle-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ツールのスキーマ定義
const GetSiteInfoSchema = z.object({});

const GetUsersSchema = z.object({
  searchKey: z.string().describe('Search key (e.g., username, email, firstname, lastname)'),
  searchValue: z.string().describe('Search value'),
});

const GetCoursesSchema = z.object({
  ids: z.array(z.number()).optional().describe('Course IDs to fetch (optional)'),
});

const GetUserCoursesSchema = z.object({
  userId: z.number().describe('User ID'),
});

const GetCourseContentsSchema = z.object({
  courseId: z.number().describe('Course ID'),
});

const GetAssignmentsSchema = z.object({
  courseIds: z.array(z.number()).optional().describe('Course IDs (optional)'),
});

const CallFunctionSchema = z.object({
  functionName: z.string().describe('Moodle Web Service function name'),
  params: z.record(z.any()).optional().describe('Function parameters'),
});

// ツールの一覧を返す（拡張版）
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // 基本的なツール
      {
        name: 'get_site_info',
        description: 'Get Moodle site information',
        inputSchema: GetSiteInfoSchema,
      },
      {
        name: 'get_users',
        description: 'Search and get user information',
        inputSchema: GetUsersSchema,
      },
      {
        name: 'get_courses',
        description: 'Get course list',
        inputSchema: GetCoursesSchema,
      },
      {
        name: 'get_user_courses',
        description: 'Get courses for a specific user',
        inputSchema: GetUserCoursesSchema,
      },
      {
        name: 'get_course_contents',
        description: 'Get course contents and modules',
        inputSchema: GetCourseContentsSchema,
      },
      {
        name: 'get_assignments',
        description: 'Get assignments from courses',
        inputSchema: GetAssignmentsSchema,
      },
      // 拡張ツール
      {
        name: 'get_grades',
        description: 'Get grades for a course',
        inputSchema: {
          type: 'object',
          properties: {
            courseId: { type: 'number', description: 'Course ID' },
            component: { type: 'string', description: 'Component name (optional)' },
            activityId: { type: 'number', description: 'Activity ID (optional)' },
            userIds: { type: 'array', items: { type: 'number' }, description: 'User IDs (optional)' },
          },
          required: ['courseId'],
        },
      },
      {
        name: 'get_forums',
        description: 'Get forums by courses',
        inputSchema: {
          type: 'object',
          properties: {
            courseIds: { type: 'array', items: { type: 'number' }, description: 'Course IDs (optional)' },
          },
        },
      },
      {
        name: 'get_categories',
        description: 'Get course categories',
        inputSchema: {
          type: 'object',
          properties: {
            criteria: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string' },
                  value: { type: 'string' },
                },
              },
              description: 'Search criteria (optional)',
            },
            addSubcategories: { type: 'boolean', description: 'Include subcategories' },
          },
        },
      },
      // Analytics API ツール
      {
        name: 'analytics_get_models',
        description: 'Get analytics prediction models',
        inputSchema: {
          type: 'object',
          properties: {
            includeDisabled: { type: 'boolean', description: 'Include disabled models' },
          },
        },
      },
      {
        name: 'analytics_get_insights',
        description: 'Get analytics insights',
        inputSchema: {
          type: 'object',
          properties: {
            modelId: { type: 'number', description: 'Model ID (optional)' },
            contextId: { type: 'number', description: 'Context ID (optional)' },
            userId: { type: 'number', description: 'User ID (optional)' },
            status: {
              type: 'string',
              enum: ['notviewed', 'viewed', 'fixed', 'notuseful'],
              description: 'Insight status',
            },
          },
        },
      },
      {
        name: 'analytics_train_model',
        description: 'Train an analytics model',
        inputSchema: {
          type: 'object',
          properties: {
            modelId: { type: 'number', description: 'Model ID' },
          },
          required: ['modelId'],
        },
      },
      {
        name: 'analytics_predict_model',
        description: 'Get predictions from an analytics model',
        inputSchema: {
          type: 'object',
          properties: {
            modelId: { type: 'number', description: 'Model ID' },
          },
          required: ['modelId'],
        },
      },
      // 汎用ツール
      {
        name: 'call_function',
        description: 'Call any Moodle Web Service function directly',
        inputSchema: CallFunctionSchema,
      },
    ],
  };
});

// ツールの実行を処理（拡張版）
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // 基本的なツールの処理（前のコードから）
    switch (name) {
      case 'get_site_info': {
        const result = await moodleClient.getSiteInfo();
        if (result.exception) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${result.message || result.exception}`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.data, null, 2),
            },
          ],
        };
      }

      case 'get_users': {
        const { searchKey, searchValue } = GetUsersSchema.parse(args);
        const result = await moodleClient.getUsers({
          criteria: [{ key: searchKey, value: searchValue }],
        });
        if (result.exception) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${result.message || result.exception}`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.data, null, 2),
            },
          ],
        };
      }

      case 'get_courses': {
        const { ids } = GetCoursesSchema.parse(args);
        const params = ids ? { options: { ids } } : {};
        const result = await moodleClient.getCourses(params);
        if (result.exception) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${result.message || result.exception}`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.data, null, 2),
            },
          ],
        };
      }

      case 'get_user_courses': {
        const { userId } = GetUserCoursesSchema.parse(args);
        const result = await moodleClient.getUserCourses(userId);
        if (result.exception) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${result.message || result.exception}`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.data, null, 2),
            },
          ],
        };
      }

      case 'get_course_contents': {
        const { courseId } = GetCourseContentsSchema.parse(args);
        const result = await moodleClient.getCourseContents(courseId);
        if (result.exception) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${result.message || result.exception}`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.data, null, 2),
            },
          ],
        };
      }

      case 'get_assignments': {
        const { courseIds } = GetAssignmentsSchema.parse(args);
        const result = await moodleClient.getAssignments(courseIds || []);
        if (result.exception) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${result.message || result.exception}`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.data, null, 2),
            },
          ],
        };
      }

      // 拡張ツールの処理
      case 'get_grades': {
        const result = await extendedHandlers.handleGetGrades(args as any);
        if (result.exception) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${result.message || result.exception}`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.data, null, 2),
            },
          ],
        };
      }

      case 'get_forums': {
        const result = await extendedHandlers.handleGetForums(args as any);
        if (result.exception) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${result.message || result.exception}`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.data, null, 2),
            },
          ],
        };
      }

      case 'get_categories': {
        const result = await extendedHandlers.handleGetCategories(args as any);
        if (result.exception) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${result.message || result.exception}`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.data, null, 2),
            },
          ],
        };
      }

      // Analytics APIツールの処理
      case 'analytics_get_models': {
        const result = await analyticsHandlers.handleGetModels(args as any);
        if (result.exception) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${result.message || result.exception}`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.data, null, 2),
            },
          ],
        };
      }

      case 'analytics_get_insights': {
        const result = await analyticsHandlers.handleGetInsights(args as any);
        if (result.exception) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${result.message || result.exception}`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.data, null, 2),
            },
          ],
        };
      }

      case 'analytics_train_model': {
        const result = await analyticsHandlers.handleTrainModel(args as any);
        if (result.exception) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${result.message || result.exception}`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.data, null, 2),
            },
          ],
        };
      }

      case 'analytics_predict_model': {
        const result = await analyticsHandlers.handlePredictModel(args as any);
        if (result.exception) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${result.message || result.exception}`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.data, null, 2),
            },
          ],
        };
      }

      case 'call_function': {
        const { functionName, params } = CallFunctionSchema.parse(args);
        const result = await moodleClient.callFunction(functionName, params);
        if (result.exception) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${result.message || result.exception}`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.data, null, 2),
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
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// サーバーを起動
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Moodle MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 