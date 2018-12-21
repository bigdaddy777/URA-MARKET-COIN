module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  // Docker

  // // Relative or absolute path to an npm installed solc-js
  networks: {
    // development: {
    //   host: "127.0.0.1",
    //   port: 8545,
    //   network_id: "*",
    //   gasPrice: 2000000000
    // },
    // test: {
    //   host: "localhost",
    //   port: 8545,
    //   network_id: "*",
    //   gasPrice: 1000000000
    // },
    // kovan: {
    //   host: "localhost",
    //   port: "8591",
    //   network_id: "*",
    //   gas: 4700000,
    //   gasPrice: 1000000000
    // },
    // core: {
    //   host: "localhost",
    //   port: "8777",
    //   network_id: "*",
    //   gas: 4700000,
    //   gasPrice: 1000000000
    // },
    // sokol: {
    //   host: "localhost",
    //   port: "8545",
    //   network_id: "*",
    //   gas: 4700000,
    //   gasPrice: 1000000000
    // },
    // coverage: {
    //   host: 'localhost',
    //   network_id: '*', // eslint-disable-line camelcase
    //   port: 8555,
    //   gas: 0xfffffffffff,
    //   gasPrice: 0x01,
    // },
    ganache: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // eslint-disable-line camelcase
      gasPrice: 1000000000
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    },
    solc: {
      version: "0.5.2",
    },
  }
};
