const request = require('supertest');

const createApp = require('../src/app')
const models = require('../src/db/models/user.model');
const { upSeed, downSeed } = require('./utils/umzug');

describe('tests for /profile path', () => {
  let app = null;
  let server = null;
  let api = null;
  let accessToken = null;

  beforeAll(async () => {
    app = createApp();
    server = app.listen(9000);
    api = request(app);
    await upSeed()
  })

  describe('GET /my-user admin user', () => {

    beforeAll(async () => {
      const user = await models.User.findByPk(1);
      const inputData = {
        email: user.email,
        password: 'admin123'
      }

      const { body: bodyLogin } = await api.post(`/api/v1/auth/login`).send(inputData);
      accessToken = bodyLogin.access_token
    })

    test('should return a status code 401 with invalid token', async () => {
      const { statusCode } = await api.get('/api/v1/profile/my-user').set({
        Authorization: `Bearer 2312321321`
      });
      expect(statusCode).toEqual(401);
    })

    test('should return a user profile', async () => {
      const user = await models.User.findByPk(1);
      const { statusCode, body } = await api.get('/api/v1/profile/my-user').set({
        Authorization: `Bearer ${accessToken}`
      });
      expect(statusCode).toEqual(200);
      expect(body.email).toEqual(user.email);
    })

    afterAll(() => {
      accessToken = null;
    })
  })

  describe('GET /my-orders customer user', () => {

    test('should return a status code 401 with invalid token', async () => {
      const { statusCode } = await api.get('/api/v1/profile/my-orders').set({
        Authorization: `Bearer 2312321321`
      });
      expect(statusCode).toEqual(401);
    })

    test('should return a user profile', async () => {
      const user = await models.User.findByPk(1);
      const inputData = {
        email: user.email,
        password: 'admin123'
      }

      const { body: bodyLogin } = await api.post(`/api/v1/auth/login`).send(inputData);
      const accessToken = bodyLogin.access_token
      const { statusCode } = await api.get('/api/v1/profile/my-orders').set({
        Authorization: `Bearer ${accessToken}`
      });
      expect(statusCode).toEqual(200);
    })
  })

  afterAll(async () => {
    await downSeed()
    server.close();
  })
});
