
module.exports = {
  // an object that defines the schema for configuration
  config: {
    runtime: {
      type: String,
      enum: ['0.6', '0.8', '0.10', '0.11', 'stable', 'latest', 'whatever'],
      default: 'whatever'
    },
    caching: {
      type: String,
      enum: ['strict', 'loose', 'none'],
      default: 'none'
    },
    test: { type: String, default: 'npm test' },
    globals: [{
      type: String
    }]
  }
}
