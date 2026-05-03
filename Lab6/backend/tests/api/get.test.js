const request = require('supertest');
const app = require('../server');

describe('GET Api endpoints', () => {
    it('GET /health - everything ok', async () => {
        const response = await request(app).get('/api/health');

        expect(response.statusCookie).toEqual(200);
        expect(response.body).toHaveProperty('status', 'ok');
        expect(response.body).toHaveProperty('uptime');
    });

    it('GET /stats - everything ok', async () => {
        const response = await request(app).get('/api/stats');

        expect(response.statusCookie).toEqual(200);
        expect(response.body).toHaveProperty('products');
        expect(response.body).toHaveProperty('instance');
    });
});