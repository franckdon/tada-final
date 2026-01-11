// Mock temporaire de Prisma pour tester l'interface sans base de données
export const prisma = {
  user: {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve({ id: 'mock-id', name: 'Mock User' }),
    update: () => Promise.resolve({ id: 'mock-id', name: 'Updated User' }),
    delete: () => Promise.resolve({ id: 'mock-id', name: 'Deleted User' }),
  },
  mission: {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve({ id: 'mock-id', title: 'Mock Mission' }),
    update: () => Promise.resolve({ id: 'mock-id', title: 'Updated Mission' }),
    delete: () => Promise.resolve({ id: 'mock-id', title: 'Deleted Mission' }),
  },
  contributorData: {
    findMany: () => Promise.resolve([]),
    createMany: () => Promise.resolve({ count: 0 }),
    deleteMany: () => Promise.resolve({ count: 0 }),
  },
  $transaction: (callback: any) => callback(prisma),
  $disconnect: () => Promise.resolve(),
};

export default prisma;
