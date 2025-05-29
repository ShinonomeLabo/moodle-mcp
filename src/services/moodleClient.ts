import axios, { AxiosInstance } from 'axios';
import { MoodleResponse, WSFunctionParams } from '../types/moodle.js';

export class MoodleClient {
  private axios: AxiosInstance;
  private wsToken: string;

  constructor(siteUrl: string, wsToken: string) {
    this.wsToken = wsToken;
    
    this.axios = axios.create({
      baseURL: `${siteUrl}/webservice/rest/server.php`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }

  async callFunction<T = any>(
    functionName: string,
    params: WSFunctionParams = {}
  ): Promise<MoodleResponse<T>> {
    try {
      const formData = new URLSearchParams();
      formData.append('wstoken', this.wsToken);
      formData.append('wsfunction', functionName);
      formData.append('moodlewsrestformat', 'json');

      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === 'object') {
              Object.entries(item).forEach(([subKey, subValue]) => {
                formData.append(`${key}[${index}][${subKey}]`, String(subValue));
              });
            } else {
              formData.append(`${key}[${index}]`, String(item));
            }
          });
        } else if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            formData.append(`${key}[${subKey}]`, String(subValue));
          });
        } else {
          formData.append(key, String(value));
        }
      });

      const response = await this.axios.post('', formData);

      if (response.data && response.data.exception) {
        return {
          exception: response.data.exception,
          errorcode: response.data.errorcode,
          message: response.data.message,
          debuginfo: response.data.debuginfo
        };
      }

      return { data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          exception: 'network_error',
          errorcode: 'network_error',
          message: error.message
        };
      }
      return {
        exception: 'unknown_error',
        errorcode: 'unknown_error',
        message: 'An unknown error occurred'
      };
    }
  }

  async getSiteInfo() {
    return this.callFunction('core_webservice_get_site_info');
  }

  async getUsers(params: { criteria: Array<{ key: string; value: string }> }) {
    return this.callFunction('core_user_get_users', params);
  }

  async getCourses(params: { options?: { ids?: number[] } } = {}) {
    return this.callFunction('core_course_get_courses', params);
  }

  async getCategories(params: {
    criteria?: Array<{ key: string; value: string }>;
    addsubcategories?: boolean;
  } = {}) {
    return this.callFunction('core_course_get_categories', params);
  }

  async getUserCourses(userId: number) {
    return this.callFunction('core_enrol_get_users_courses', { userid: userId });
  }

  async getCourseContents(courseId: number, options: any = {}) {
    return this.callFunction('core_course_get_contents', {
      courseid: courseId,
      ...options
    });
  }

  async getAssignments(courseIds: number[] = [], capabilities: string[] = []) {
    return this.callFunction('mod_assign_get_assignments', {
      courseids: courseIds,
      capabilities: capabilities
    });
  }

  async getForumsByCourses(courseIds: number[] = []) {
    return this.callFunction('mod_forum_get_forums_by_courses', {
      courseids: courseIds
    });
  }

  async getGrades(
    courseId: number,
    component?: string,
    activityId?: number,
    userIds: number[] = []
  ) {
    return this.callFunction('core_grades_get_grades', {
      courseid: courseId,
      component,
      activityId,
      userids: userIds
    });
  }
} 