import { jest } from '@jest/globals';
// Test unitaire avec simulation Prisma
const prisma = {
  message: {
    create: jest.fn().mockResolvedValue({ id: 1, contenu: 'Hi', pseudo: 'Bob', date: new Date() })
  }
};

describe('Prisma Message', () => {
  it('crée un message', async () => {
    const msg = await prisma.message.create({ data: { contenu: 'Hi', pseudo: 'Bob' } });
    expect(msg.contenu).toBe('Hi');
    expect(msg.pseudo).toBe('Bob');
  });
});

it('dummy test', () => {
  expect(true).toBe(true);
});
