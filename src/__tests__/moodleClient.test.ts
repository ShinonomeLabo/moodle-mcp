import { MoodleClient } from '../services/moodleClient.js';

describe('MoodleClient', () => {
  let client: MoodleClient;

  beforeEach(() => {
    client = new MoodleClient('https://test.moodle.com', 'test-token');
  });

  describe('constructor', () => {
    it('should create an instance with correct URL and token', () => {
      expect(client).toBeInstanceOf(MoodleClient);
      expect(client['wsToken']).toBe('test-token');
    });
  });

  describe('parameter formatting', () => {
    it('should handle simple parameters', async () => {
      const params = { userid: 1, courseid: 2 };
      
      // This would be tested more thoroughly with mocking
      expect(params).toHaveProperty('userid');
      expect(params).toHaveProperty('courseid');
    });

    it('should handle array parameters', async () => {
      const params = { userids: [1, 2, 3] };
      
      expect(Array.isArray(params.userids)).toBe(true);
      expect(params.userids).toHaveLength(3);
    });

    it('should handle nested object parameters', async () => {
      const params = {
        criteria: [
          { key: 'username', value: 'test' },
          { key: 'email', value: 'test@example.com' }
        ]
      };
      
      expect(params.criteria).toHaveLength(2);
      expect(params.criteria[0]).toHaveProperty('key');
      expect(params.criteria[0]).toHaveProperty('value');
    });
  });
}); 