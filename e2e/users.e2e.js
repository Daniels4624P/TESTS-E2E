const request = require('supertest');

const createApp = require('../src/app')
const models = require('../src/db/models/user.model')
const { upSeed, downSeed } = require('./utils/umzug')

describe('tests for /users path', () => {
  let app = null;
  let server = null;
  let api = null;

  beforeAll(async () => {
    app = createApp();
    server = app.listen(9000);
    api = request(app);
    await upSeed()
  })

  describe('GET /users', () => {
    test('should return an user', async () => {
      const inputId = '1';
      const user = await models.User.findByPk(inputId);
      const { statusCode, body } = await api.get(`/api/v1/users/${inputId}`);
      expect(statusCode).toEqual(200);
      expect(body.id).toEqual(user.id);
      expect(body.email).toEqual(user.email);
    })
  })

  describe('POST /users', () => {
    test('should return a 400 bad request with ivalid password', async () => {
      // Arrange
      const inputData = {
        email: 'nicolas@mail.com',
        password: '-----',
      };
      // Act
      const response = await api.post('/api/v1/users').send(inputData);
      // Assert
      expect(response).toBeTruthy();
      expect(response.statusCode).toEqual(400);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body.message).toMatch(/password/);
    })

    test('should return a 400 bad request with invalid email', async () => {
      // Arrange
      const inputData = {
        email: '---------',
        password: 'sadjkhasdkhkajsdhjkhdasjk',
      };
      // Act
      const { statusCode, body } = await api.post('/api/v1/users').send(inputData);
      // Assert
      expect(body).toBeTruthy();
      expect(statusCode).toEqual(400);
      expect(body.message).toMatch(/email/);
    })

    test('should return a new user', async () => {
      // Arrange
      const inputData = {
        email: 'pepito123@mail.com',
        password: 'pepito123',
      };
      // Act
      const { statusCode, body } = await api.post('/api/v1/users').send(inputData);
      // Assert
      const user = await models.User.findByPk(body.id)
      expect(statusCode).toEqual(201);
      expect(user).toBeTruthy()
      expect(user.role).toEqual('admin')
      expect(user.email).toEqual(inputData.email)
    })
  })

  describe('PATCH /users', () => {
    // test
  })

  describe('DELETE /users', () => {
    // test
  })

  afterAll(async () => {
    await downSeed();
    server.close();
  })
});
