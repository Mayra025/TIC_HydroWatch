// module.exports = {
//   Chart: class {
//     constructor(ctx, config) {
//       this.ctx = ctx;
//       this.config = config;
//       this.update = jest.fn();
//       this.destroy = jest.fn();
//     }
//   },
// };

// module.exports = {
//   Chart: () => null,
//   registerables: [],
// };

// __mocks__/chart.js
// const ChartJS = {
//   register: jest.fn(),
// };

// export const CategoryScale = jest.fn();
// export const LinearScale = jest.fn();
// export const PointElement = jest.fn();
// export const LineElement = jest.fn();
// export const Title = jest.fn();
// export const Tooltip = jest.fn();
// export const Legend = jest.fn();
// export const TimeScale = jest.fn();

// export default ChartJS;

// __mocks__/chart.js
export const Chart = {
  register: jest.fn(),
};

export const CategoryScale = jest.fn();
export const LinearScale = jest.fn();
export const PointElement = jest.fn();
export const LineElement = jest.fn();
export const Title = jest.fn();
export const Tooltip = jest.fn();
export const Legend = jest.fn();
export const TimeScale = jest.fn();
