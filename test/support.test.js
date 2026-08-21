import app from "../src/app.js";
import request from "supertest";

import { expect } from "chai";


describe ('Support endpoint', () => {
    it('Deberia ejecutar el endpoint de prueba del Looger', async () =>{
        const response = await request(app).get('/api/logger-test')

        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal('succes');

    })

    it('Deberia servir la documentacion de Swagger', async () => {
        const response = await request(app).get('/api/docs');

        expect(response.status).to.be.oneOf([200, 301, 302]);
    })

    it('Deberia responder 404 para una ruta inexistente', async () => {
        const response = await request(app).get('/api/routes-inexist');

        expect(response.status).to.equal(404);
        expect(response.body.status).to.equal('error');
        expect(response.body).to.have.property('message');
    })
})