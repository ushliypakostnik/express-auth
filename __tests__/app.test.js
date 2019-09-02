import request from 'supertest';

import app from '../app';

describe('test the api', () => {
  test('GET /test', (done) => {
    request(app).get('/test').then((response) => {
      expect(response.statusCode).toBe(200);
      done();
    });
  });
});
