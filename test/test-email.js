const { createUser, resetFixtures } = require('./fixtures');
const request = require('supertest');

const apiPrefix = '/api/v1';
const app = global.server;

let user1;

describe('E-mail notifications', function () {
  before(async function () {
    await resetFixtures();
    user1 = await createUser();
  });

  it('/forgot_password should return error when emails is misconfigured', async function () {
    await request(app)
      .post(apiPrefix + '/forgot_password')
      .send({
        emailOrUsername: user1.email
      })
      .expect('Content-Type', /json/)
      .expect(500);
  });
});
