module.exports = {
    jsPDF: jest.fn().mockImplementation(() => ({
      autoTable: jest.fn(),
      save: jest.fn(),
    })),
  };
  