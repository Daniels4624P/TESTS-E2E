const request = require('supertest');

const { models } = require('../src/db/sequelize')
const createApp = require('../src/app')
const { upSeed, downSeed } = require('../e2e/utils/umzug')

describe('tests for categories endpoints', () => {
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

  describe('POST /categories with admin user', () => {

    beforeAll(async () => {
      const user = await models.User.findByPk(1);
      const inputData = {
        email: user.email,
        password: 'admin123'
      }

      const { body: bodyLogin } = await api.post(`/api/v1/auth/login`).send(inputData);
      accessToken = bodyLogin.access_token
    })

    test('should return 401', async () => {
      const inputData = {
        name: 'Categoria Nueva',
        image: 'https://dhsajdhasjkh.dsajkdhaskj.com',
      }
      const { statusCode } = await api.post('/api/v1/categories').send(inputData);
      expect(statusCode).toEqual(401);
    })

    test('should return 201 with a new Category', async () => {
      const inputData = {
        name: 'Categoria Nueva',
        image: 'https://dhsajdhasjkh.dsajkdhaskj.com',
      }
      const { statusCode, body } = await api.post('/api/v1/categories').send(inputData).set({ Authorization: `Bearer ${accessToken}` });
      expect(statusCode).toEqual(201);
      const category = await models.Category.findByPk(body.id)
      expect(category.name).toEqual(inputData.name)
      expect(category.image).toEqual(inputData.image)
    })

    afterAll(() => {
      accessToken = null;
    })
  })

  describe('POST /categories with customer user', () => {

    beforeAll(async () => {
      const user = await models.User.findByPk(2);
      const inputData = {
        email: user.email,
        password: 'customer123'
      }

      const { body: bodyLogin } = await api.post(`/api/v1/auth/login`).send(inputData);
      accessToken = bodyLogin.access_token
    })

    test('should return 401 without token', async () => {
      const inputData = {
        name: 'Categoria Nueva',
        image: 'https://dhsajdhasjkh.dsajkdhaskj.com',
      }
      const { statusCode } = await api.post('/api/v1/categories').send(inputData);
      expect(statusCode).toEqual(401);
    })

    test('should return 401 with customer token', async () => {
      const inputData = {
        name: 'Categoria Nueva',
        image: 'https://dhsajdhasjkh.dsajkdhaskj.com',
      }
      const { statusCode } = await api.post('/api/v1/categories').send(inputData).set({ Authorization: `Bearer ${accessToken}` });
      expect(statusCode).toEqual(401);
    })

    afterAll(() => {
      accessToken = null;
    })
  })

  afterAll(async() => {
    await downSeed()
    server.close();
  })
});
