module.exports = {
    name: 'error',
    async execute(error, client) {
      console.error('❌ Global Error:', error);
    },
  };
  