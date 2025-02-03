export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], 
  setupFiles: ["<rootDir>/__mocks__/react-chartjs-2.js"],   ////

  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    // '^.+\\.tsx?$': 'ts-jest',

    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest', // Usa babel-jest para procesar archivos

  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!chart.js)'], 

  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
    "\\.(png|jpg|jpeg|gif|webp)$": "<rootDir>/__mocks__/fileMock.js",
    // '^chart.js$': '<rootDir>/__mocks__/chart.js',
    '^chart.js$': '<rootDir>/__mocks__/chart.js',
    "^chartjs-adapter-date-fns$": "<rootDir>/__mocks__/chartjs-adapter-date-fns.js"


  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'], // Soporte para TypeScript

// extensionsToTreatAsEsm: ['.ts', '.tsx'],
//   globals: {
//     'ts-jest': {
//       useESM: true,
//     },
//   },
};

  