import { z } from 'zod';
import { MoodleClient } from '../services/moodleClient.js';

// グレード関連のスキーマ
export const GetGradesSchema = z.object({
  courseId: z.number().describe('Course ID'),
  component: z.string().optional().describe('Component name (e.g., mod_assign)'),
  activityId: z.number().optional().describe('Activity ID'),
  userIds: z.array(z.number()).optional().describe('User IDs (optional)'),
});

// フォーラム関連のスキーマ
export const GetForumsSchema = z.object({
  courseIds: z.array(z.number()).optional().describe('Course IDs (optional)'),
});

export const GetForumDiscussionsSchema = z.object({
  forumId: z.number().describe('Forum ID'),
  page: z.number().optional().describe('Page number'),
  perPage: z.number().optional().describe('Items per page'),
});

// メッセージ関連のスキーマ
export const SendMessageSchema = z.object({
  userId: z.number().describe('User ID to send message to'),
  message: z.string().describe('Message content'),
});

export const GetMessagesSchema = z.object({
  userId: z.number().describe('User ID'),
  type: z.enum(['conversations', 'notifications']).optional(),
  read: z.boolean().optional(),
});

// カテゴリ関連のスキーマ
export const GetCategoriesSchema = z.object({
  criteria: z
    .array(
      z.object({
        key: z.string().describe('Search key'),
        value: z.string().describe('Search value'),
      })
    )
    .optional()
    .describe('Search criteria'),
  addSubcategories: z.boolean().optional().describe('Include subcategories'),
});

// カレンダー関連のスキーマ
export const GetCalendarEventsSchema = z.object({
  courseIds: z.array(z.number()).optional().describe('Course IDs'),
  timeStart: z.number().optional().describe('Start time (Unix timestamp)'),
  timeEnd: z.number().optional().describe('End time (Unix timestamp)'),
});

// バッジ関連のスキーマ
export const GetBadgesSchema = z.object({
  courseId: z.number().optional().describe('Course ID (optional)'),
  userId: z.number().optional().describe('User ID (optional)'),
});

// 拡張ハンドラー関数
export class ExtendedHandlers {
  constructor(private moodleClient: MoodleClient) {}

  async handleGetGrades(params: z.infer<typeof GetGradesSchema>) {
    const result = await this.moodleClient.getGrades(
      params.courseId,
      params.component,
      params.activityId,
      params.userIds || []
    );
    return result;
  }

  async handleGetForums(params: z.infer<typeof GetForumsSchema>) {
    const result = await this.moodleClient.getForumsByCourses(
      params.courseIds || []
    );
    return result;
  }

  async handleGetForumDiscussions(params: z.infer<typeof GetForumDiscussionsSchema>) {
    const result = await this.moodleClient.callFunction(
      'mod_forum_get_forum_discussions',
      {
        forumid: params.forumId,
        page: params.page || 0,
        perpage: params.perPage || 10,
      }
    );
    return result;
  }

  async handleSendMessage(params: z.infer<typeof SendMessageSchema>) {
    const result = await this.moodleClient.callFunction(
      'core_message_send_instant_messages',
      {
        messages: [
          {
            touserid: params.userId,
            text: params.message,
            textformat: 1, // FORMAT_HTML
          },
        ],
      }
    );
    return result;
  }

  async handleGetMessages(params: z.infer<typeof GetMessagesSchema>) {
    const functionName =
      params.type === 'notifications'
        ? 'core_message_get_messages'
        : 'core_message_get_conversations';

    const result = await this.moodleClient.callFunction(functionName, {
      userid: params.userId,
      read: params.read,
    });
    return result;
  }

  async handleGetCategories(params: z.infer<typeof GetCategoriesSchema>) {
    const result = await this.moodleClient.getCategories({
      criteria: params.criteria,
      addsubcategories: params.addSubcategories,
    });
    return result;
  }

  async handleGetCalendarEvents(params: z.infer<typeof GetCalendarEventsSchema>) {
    const result = await this.moodleClient.callFunction(
      'core_calendar_get_calendar_events',
      {
        options: {
          courseids: params.courseIds,
          timestart: params.timeStart,
          timeend: params.timeEnd,
        },
      }
    );
    return result;
  }

  async handleGetBadges(params: z.infer<typeof GetBadgesSchema>) {
    const functionName = params.courseId
      ? 'core_badges_get_course_badges'
      : 'core_badges_get_user_badges';

    const result = await this.moodleClient.callFunction(functionName, {
      courseid: params.courseId,
      userid: params.userId,
    });
    return result;
  }

  // コース作成
  async handleCreateCourse(params: {
    fullname: string;
    shortname: string;
    categoryid: number;
    summary?: string;
    format?: string;
    visible?: boolean;
  }) {
    const result = await this.moodleClient.callFunction(
      'core_course_create_courses',
      {
        courses: [params],
      }
    );
    return result;
  }

  // ユーザー登録
  async handleEnrollUser(params: {
    userId: number;
    courseId: number;
    roleId?: number;
  }) {
    const result = await this.moodleClient.callFunction(
      'enrol_manual_enrol_users',
      {
        enrolments: [
          {
            userid: params.userId,
            courseid: params.courseId,
            roleid: params.roleId || 5, // デフォルトは学生ロール
          },
        ],
      }
    );
    return result;
  }

  // グループ関連
  async handleGetGroups(courseId: number) {
    const result = await this.moodleClient.callFunction(
      'core_group_get_course_groups',
      {
        courseid: courseId,
      }
    );
    return result;
  }

  async handleCreateGroup(params: {
    courseId: number;
    name: string;
    description?: string;
  }) {
    const result = await this.moodleClient.callFunction(
      'core_group_create_groups',
      {
        groups: [
          {
            courseid: params.courseId,
            name: params.name,
            description: params.description || '',
          },
        ],
      }
    );
    return result;
  }

  // Wiki関連
  async handleGetWikis(courseId: number) {
    const result = await this.moodleClient.callFunction(
      'mod_wiki_get_wikis_by_courses',
      {
        courseids: [courseId],
      }
    );
    return result;
  }

  // データベース活動関連
  async handleGetDatabases(courseIds: number[]) {
    const result = await this.moodleClient.callFunction(
      'mod_data_get_databases_by_courses',
      {
        courseids: courseIds,
      }
    );
    return result;
  }

  // 完了状況
  async handleGetCompletionStatus(courseId: number, userId: number) {
    const result = await this.moodleClient.callFunction(
      'core_completion_get_course_completion_status',
      {
        courseid: courseId,
        userid: userId,
      }
    );
    return result;
  }
} 