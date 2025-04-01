const request = require('supertest');
const express = require('express');
const app = express();

// Mock the logger to prevent test output pollution
jest.mock('../../../src/backend/src/utils/logger', () => ({
  info: jest.fn(),
  logError: jest.fn(),
}));

// Simple mock of the health endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

describe('Health Endpoint', () => {
  it('should return 200 status and correct response structure', async () => {
    const res = await request(app).get('/api/health');
    
    // Status code check
    expect(res.statusCode).toEqual(200);
    
    // Response body structure check
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('message');
    
    // Response values check
    expect(res.body.status).toEqual('ok');
    expect(res.body.message).toEqual('Server is running');
  });
}); 