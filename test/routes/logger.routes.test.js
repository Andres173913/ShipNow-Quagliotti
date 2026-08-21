import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';

describe('Logger Routes Integration Tests', () => {
  
  const BASE_URL = '/api/logger-test'; 

  it('debería generar un log de nivel info en la ruta raíz y responder 200', async () => {
    const response = await request(app).get(BASE_URL);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('status', 'succes');
    expect(response.body.message).to.equal('Logger endpoint working');
  });

  it('debería generar un log de nivel debug', async () => {
    const response = await request(app).get(`${BASE_URL}/debug`);
    expect(response.status).to.equal(200);
    expect(response.text).to.equal('Debug log generated');
  });

  it('debería generar un log de nivel info', async () => {
    const response = await request(app).get(`${BASE_URL}/info`);
    expect(response.status).to.equal(200);
    expect(response.text).to.equal('Info log generated');
  });

  it('debería generar un log de nivel warn', async () => {
    const response = await request(app).get(`${BASE_URL}/warn`);
    expect(response.status).to.equal(200);
    expect(response.text).to.equal('Warn log generated');
  });

  it('debería generar un log de nivel error', async () => {
    const response = await request(app).get(`${BASE_URL}/error`);
    expect(response.status).to.equal(200);
    expect(response.text).to.equal('Error log generated');
  });

  it('debería generar un log de nivel fatal', async () => {
    const response = await request(app).get(`${BASE_URL}/fatal`);
    expect(response.status).to.equal(200);
    expect(response.text).to.equal('Fatal log generated');
  });

});
