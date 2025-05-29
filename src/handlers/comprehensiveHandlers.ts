import { z } from 'zod';
import { MoodleClient } from '../services/moodleClient.js';

// ユーザー管理関連のスキーマ
export const CreateUserSchema = z.object({
  username: z.string().describe('Username'),
  password: z.string().describe('Password'),
  firstname: z.string().describe('First name'),
  lastname: z.string().describe('Last name'),
  email: z.string().describe('Email address'),
  auth: z.string().optional().default('manual').describe('Authentication method'),
  idnumber: z.string().optional().describe('ID number'),
  lang: z.string().optional().describe('Language'),
  timezone: z.string().optional().describe('Timezone'),
  description: z.string().optional().describe('Description'),
  customFields: z.array(z.object({
    type: z.string(),
    name: z.string(),
    value: z.string(),
  })).optional(),
});

export const UpdateUserSchema = z.object({
  id: z.number().describe('User ID'),
  username: z.string().optional(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  auth: z.string().optional(),
  suspended: z.boolean().optional(),
  customFields: z.array(z.object({
    type: z.string(),
    name: z.string(),
    value: z.string(),
  })).optional(),
});

export const DeleteUserSchema = z.object({
  userIds: z.array(z.number()).describe('User IDs to delete'),
});

// ロール管理関連のスキーマ
export const AssignRoleSchema = z.object({
  roleId: z.number().describe('Role ID'),
  userId: z.number().describe('User ID'),
  contextId: z.number().describe('Context ID'),
});

export const UnassignRoleSchema = z.object({
  roleId: z.number().describe('Role ID'),
  userId: z.number().describe('User ID'),
  contextId: z.number().describe('Context ID'),
});

// ファイル管理関連のスキーマ
export const UploadFileSchema = z.object({
  component: z.string().describe('Component name'),
  filearea: z.string().describe('File area'),
  itemId: z.number().describe('Item ID'),
  filepath: z.string().describe('File path'),
  filename: z.string().describe('File name'),
  fileContent: z.string().describe('Base64 encoded file content'),
});

export const GetFilesSchema = z.object({
  contextId: z.number().describe('Context ID'),
  component: z.string().describe('Component name'),
  filearea: z.string().describe('File area'),
  itemId: z.number().describe('Item ID'),
  filepath: z.string().optional().describe('File path'),
  filename: z.string().optional().describe('File name'),
});

// コホート管理関連のスキーマ
export const CreateCohortSchema = z.object({
  name: z.string().describe('Cohort name'),
  idnumber: z.string().describe('ID number'),
  description: z.string().optional().describe('Description'),
  descriptionformat: z.number().optional().default(1),
  visible: z.boolean().optional().default(true),
});

export const AddCohortMemberSchema = z.object({
  cohortId: z.number().describe('Cohort ID'),
  userId: z.number().describe('User ID'),
});

// 小テスト関連のスキーマ
export const GetQuizzesSchema = z.object({
  courseIds: z.array(z.number()).describe('Course IDs'),
});

export const GetQuizAttemptsSchema = z.object({
  quizId: z.number().describe('Quiz ID'),
  userId: z.number().optional().describe('User ID (optional)'),
  status: z.enum(['finished', 'inprogress', 'overdue', 'abandoned']).optional(),
});

export const StartQuizAttemptSchema = z.object({
  quizId: z.number().describe('Quiz ID'),
  userId: z.number().optional().describe('User ID (optional, defaults to current user)'),
});

// SCORM関連のスキーマ
export const GetScormsSchema = z.object({
  courseIds: z.array(z.number()).describe('Course IDs'),
});

export const GetScormTracksSchema = z.object({
  scormId: z.number().describe('SCORM ID'),
  userId: z.number().describe('User ID'),
  attempt: z.number().optional().describe('Attempt number'),
});

// レポート関連のスキーマ
export const GetCourseCompletionReportSchema = z.object({
  courseId: z.number().describe('Course ID'),
  userIds: z.array(z.number()).optional().describe('User IDs (optional)'),
});

export const GetActivityCompletionReportSchema = z.object({
  courseId: z.number().describe('Course ID'),
  userId: z.number().describe('User ID'),
});

export const GetGradeReportSchema = z.object({
  courseId: z.number().describe('Course ID'),
  userId: z.number().optional().describe('User ID (optional)'),
  groupId: z.number().optional().describe('Group ID (optional)'),
});

// 包括的なハンドラークラス
export class ComprehensiveHandlers {
  constructor(private moodleClient: MoodleClient) {}

  // ユーザー管理
  async handleCreateUser(params: z.infer<typeof CreateUserSchema>) {
    const userParams: any = {
      username: params.username,
      password: params.password,
      firstname: params.firstname,
      lastname: params.lastname,
      email: params.email,
      auth: params.auth,
    };

    if (params.idnumber) userParams.idnumber = params.idnumber;
    if (params.lang) userParams.lang = params.lang;
    if (params.timezone) userParams.timezone = params.timezone;
    if (params.description) userParams.description = params.description;
    if (params.customFields) userParams.customfields = params.customFields;

    const result = await this.moodleClient.callFunction(
      'core_user_create_users',
      { users: [userParams] }
    );
    return result;
  }

  async handleUpdateUser(params: z.infer<typeof UpdateUserSchema>) {
    const userParams: any = { id: params.id };

    if (params.username) userParams.username = params.username;
    if (params.firstname) userParams.firstname = params.firstname;
    if (params.lastname) userParams.lastname = params.lastname;
    if (params.email) userParams.email = params.email;
    if (params.password) userParams.password = params.password;
    if (params.auth) userParams.auth = params.auth;
    if (params.suspended !== undefined) userParams.suspended = params.suspended;
    if (params.customFields) userParams.customfields = params.customFields;

    const result = await this.moodleClient.callFunction(
      'core_user_update_users',
      { users: [userParams] }
    );
    return result;
  }

  async handleDeleteUser(params: z.infer<typeof DeleteUserSchema>) {
    const result = await this.moodleClient.callFunction(
      'core_user_delete_users',
      { userids: params.userIds }
    );
    return result;
  }

  // ロール管理
  async handleAssignRole(params: z.infer<typeof AssignRoleSchema>) {
    const result = await this.moodleClient.callFunction(
      'core_role_assign_roles',
      {
        assignments: [{
          roleid: params.roleId,
          userid: params.userId,
          contextid: params.contextId,
        }]
      }
    );
    return result;
  }

  async handleUnassignRole(params: z.infer<typeof UnassignRoleSchema>) {
    const result = await this.moodleClient.callFunction(
      'core_role_unassign_roles',
      {
        unassignments: [{
          roleid: params.roleId,
          userid: params.userId,
          contextid: params.contextId,
        }]
      }
    );
    return result;
  }

  // ファイル管理
  async handleUploadFile(params: z.infer<typeof UploadFileSchema>) {
    const result = await this.moodleClient.callFunction(
      'core_files_upload',
      {
        component: params.component,
        filearea: params.filearea,
        itemid: params.itemId,
        filepath: params.filepath,
        filename: params.filename,
        filecontent: params.fileContent,
      }
    );
    return result;
  }

  async handleGetFiles(params: z.infer<typeof GetFilesSchema>) {
    const result = await this.moodleClient.callFunction(
      'core_files_get_files',
      {
        contextid: params.contextId,
        component: params.component,
        filearea: params.filearea,
        itemid: params.itemId,
        filepath: params.filepath || '/',
        filename: params.filename || '',
      }
    );
    return result;
  }

  // コホート管理
  async handleCreateCohort(params: z.infer<typeof CreateCohortSchema>) {
    const result = await this.moodleClient.callFunction(
      'core_cohort_create_cohorts',
      {
        cohorts: [{
          name: params.name,
          idnumber: params.idnumber,
          description: params.description,
          descriptionformat: params.descriptionformat,
          visible: params.visible,
        }]
      }
    );
    return result;
  }

  async handleAddCohortMember(params: z.infer<typeof AddCohortMemberSchema>) {
    const result = await this.moodleClient.callFunction(
      'core_cohort_add_cohort_members',
      {
        members: [{
          cohortid: params.cohortId,
          userid: params.userId,
        }]
      }
    );
    return result;
  }

  // 小テスト関連
  async handleGetQuizzes(params: z.infer<typeof GetQuizzesSchema>) {
    const result = await this.moodleClient.callFunction(
      'mod_quiz_get_quizzes_by_courses',
      { courseids: params.courseIds }
    );
    return result;
  }

  async handleGetQuizAttempts(params: z.infer<typeof GetQuizAttemptsSchema>) {
    const result = await this.moodleClient.callFunction(
      'mod_quiz_get_user_attempts',
      {
        quizid: params.quizId,
        userid: params.userId || 0,
        status: params.status || 'finished',
      }
    );
    return result;
  }

  async handleStartQuizAttempt(params: z.infer<typeof StartQuizAttemptSchema>) {
    const result = await this.moodleClient.callFunction(
      'mod_quiz_start_attempt',
      {
        quizid: params.quizId,
        userid: params.userId,
      }
    );
    return result;
  }

  // SCORM関連
  async handleGetScorms(params: z.infer<typeof GetScormsSchema>) {
    const result = await this.moodleClient.callFunction(
      'mod_scorm_get_scorms_by_courses',
      { courseids: params.courseIds }
    );
    return result;
  }

  async handleGetScormTracks(params: z.infer<typeof GetScormTracksSchema>) {
    const result = await this.moodleClient.callFunction(
      'mod_scorm_get_scorm_sco_tracks',
      {
        scormid: params.scormId,
        userid: params.userId,
        attempt: params.attempt || 0,
      }
    );
    return result;
  }

  // レポート関連
  async handleGetCourseCompletionReport(params: z.infer<typeof GetCourseCompletionReportSchema>) {
    const result = await this.moodleClient.callFunction(
      'report_completion_get_course_completion_status',
      {
        courseid: params.courseId,
        userids: params.userIds,
      }
    );
    return result;
  }

  async handleGetActivityCompletionReport(params: z.infer<typeof GetActivityCompletionReportSchema>) {
    const result = await this.moodleClient.callFunction(
      'core_completion_get_activities_completion_status',
      {
        courseid: params.courseId,
        userid: params.userId,
      }
    );
    return result;
  }

  async handleGetGradeReport(params: z.infer<typeof GetGradeReportSchema>) {
    const result = await this.moodleClient.callFunction(
      'gradereport_user_get_grade_items',
      {
        courseid: params.courseId,
        userid: params.userId,
        groupid: params.groupId,
      }
    );
    return result;
  }

  // 通知関連
  async handleGetNotifications(userId: number) {
    const result = await this.moodleClient.callFunction(
      'core_message_get_user_notification_preferences',
      { userid: userId }
    );
    return result;
  }

  async handleMarkNotificationRead(notificationId: number) {
    const result = await this.moodleClient.callFunction(
      'core_message_mark_notification_read',
      { notificationid: notificationId }
    );
    return result;
  }

  // ブログ関連
  async handleGetBlogEntries(filters: {
    userId?: number;
    courseId?: number;
    groupId?: number;
    tagId?: number;
  } = {}) {
    const result = await this.moodleClient.callFunction(
      'core_blog_get_entries',
      {
        filters: filters,
      }
    );
    return result;
  }

  // タグ関連
  async handleGetTags(params: {
    collection?: string;
    area?: string;
    itemType?: string;
    itemId?: number;
  } = {}) {
    const result = await this.moodleClient.callFunction(
      'core_tag_get_tags',
      params
    );
    return result;
  }
} 