// export const getFirestore = jest.fn();
// export const collection = jest.fn();
// export const doc = jest.fn();
// export const getDoc = jest.fn();
// export const onSnapshot = jest.fn();
// export const query = jest.fn();
// export const where = jest.fn();
// export const orderBy = jest.fn();

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    orderBy: jest.fn(),
    onSnapshot: jest.fn(),
    limit: jest.fn(),
  }));
  