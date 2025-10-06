const request = require('supertest')

const createApp = require('../src/app')
const models = require('../src/db/models/user.model')
const { upSeed, downSeed } = require('./utils/umzug');

const mockSendMail = jest.fn();

jest.mock('nodemailer', () => {
  return {
    createTransport: jest.fn().mockImplementation(() => {
      return {
        sendMail: mockSendMail
      }
    })
  }
})

describe('tests for auth endpoints', () => {
  let app
  let server
  let api

  beforeAll(async () => {
    app = createApp()
    server = app.listen(9000)
    api = request(app)
    await upSeed()
  })

  describe('POST /login', () => {
    test('should return 401 unhautorized with invalid email and invalid password', async () => {
      const inputData = {
        email: 'emailfake@mail.com',
        password: 'sdasdsadsadfs',
      };
      const { statusCode } = await api.post('/api/v1/auth/login').send(inputData);
      expect(statusCode).toEqual(401);
    })

    test('should return 200 success with valid email and valid password', async () => {
      const inputData = {
        email: 'admin@mail.com',
        password: 'admin123',
      };
      const user = await models.User.findByPk(1);
      const { statusCode, body } = await api.post('/api/v1/auth/login').send(inputData);
      expect(statusCode).toEqual(200);
      expect(body.access_token).toBeTruthy();
      expect(body.user.id).toBe(1);
      expect(body.user.email).toEqual(user.email);
      expect(body.user.password).toBeUndefined();
    })
  })

  describe('POST /recovery', () => {

    beforeAll(() => {
      mockSendMail.mockClear();
    })

    test('should return a 401', async () => {
      const inputData = {
        email: 'emailfake@mail.com'
      }
      const { statusCode } = await api.post('/api/v1/auth/recovery').send(inputData);
      expect(statusCode).toEqual(401)
    })

    test('should send mail', async () => {
      const user = await models.User.findByPk(1)
      const inputData = {
        email: user.email
      }
      mockSendMail.mockResolvedValue(true);
      const { statusCode, body } = await api.post('/api/v1/auth/recovery').send(inputData);
      expect(statusCode).toEqual(200)
      expect(body.message).toEqual('mail sent')
      expect(mockSendMail).toHaveBeenCalled();
    })
  })

  afterAll(async () => {
    await downSeed()
    server.close()
  })
})
