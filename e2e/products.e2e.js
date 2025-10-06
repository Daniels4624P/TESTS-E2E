const request = require('supertest')

const { models } = require('../src/db/sequelize')
const createApp = require('../src/app')
const { upSeed, downSeed } = require('./utils/umzug')

describe('tests for products endpoints', () => {

  let api = null;
  let server = null;
  let app = null;

  beforeAll(async () => {
    app = createApp()
    server = app.listen(9000)
    api = request(app)
    await upSeed()
  })

  describe('GET /products', () => {
    test('Get all products', async () => {
      const { statusCode, body } = await api.get('/api/v1/products')
      expect(statusCode).toEqual(200)
      const products = await models.Product.findAll();
      expect(body.length).toEqual(products.length);
      expect(body[0].category).toBeTruthy();
    })

    test('should return two products with limit = 2 and offset = 0', async () => {
      const limit = 2
      const offset = 0
      const { statusCode, body } = await api.get(`/api/v1/products?limit=${limit}&offset=${offset}`)
      expect(statusCode).toEqual(200)
      expect(body.length).toEqual(2);
      expect(body[0].category).toBeTruthy();
    })

    test('should return two products with limit = 2 and offset = 2', async () => {
      const limit = 2
      const offset = 2
      const { statusCode, body } = await api.get(`/api/v1/products?limit=${limit}&offset=${offset}`)
      expect(statusCode).toEqual(200)
      expect(body.length).toEqual(2);
      expect(body[0].category).toBeTruthy();
    })
  })

  afterAll(async () => {
    await downSeed()
    server.close()
  })
})
