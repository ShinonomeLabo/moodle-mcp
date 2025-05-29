/**
 * Moodle Web Service API Types
 */

// 基本的なレスポンス型
export interface MoodleResponse<T = any> {
  data?: T;
  exception?: string;
  errorcode?: string;
  message?: string;
  debuginfo?: string;
}

// ユーザー関連の型
export interface MoodleUser {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  fullname: string;
  email: string;
  auth?: string;
  confirmed?: boolean;
  lang?: string;
  theme?: string;
  timezone?: string;
  description?: string;
  profileimageurl?: string;
  profileimageurlsmall?: string;
}

// コース関連の型
export interface MoodleCourse {
  id: number;
  shortname: string;
  fullname: string;
  displayname?: string;
  categoryid: number;
  summary?: string;
  summaryformat?: number;
  format?: string;
  visible?: boolean;
  lang?: string;
  startdate?: number;
  enddate?: number;
  timecreated?: number;
  timemodified?: number;
}

// カテゴリ関連の型
export interface MoodleCategory {
  id: number;
  name: string;
  description?: string;
  descriptionformat?: number;
  parent?: number;
  coursecount?: number;
  visible?: boolean;
  theme?: string;
}

// アサインメント関連の型
export interface MoodleAssignment {
  id: number;
  course: number;
  name: string;
  intro?: string;
  introformat?: number;
  duedate?: number;
  grade?: number;
  gradepass?: number;
  maxattempts?: number;
}

// グレード関連の型
export interface MoodleGrade {
  userid: number;
  assignment?: number;
  grade?: number;
  grademax?: number;
  grademin?: number;
  feedback?: string;
  timecreated?: number;
  timemodified?: number;
}

// フォーラム関連の型
export interface MoodleForum {
  id: number;
  course: number;
  name: string;
  intro?: string;
  type?: string;
  numdiscussions?: number;
}

// Web Service関数のパラメータ型
export interface WSFunctionParams {
  [key: string]: any;
}

// Web Service関数の定義
export interface WSFunction {
  name: string;
  description: string;
  type: 'read' | 'write';
  ajax: boolean;
  loginrequired: boolean;
  params?: WSFunctionParams;
} 