/** Next.js config added by assistant to set turbopack root if needed and provide safe defaults */
const path = require('path');
module.exports = {
  turbopack: {
    // ensure turbopack resolves from workspace root if it tries to infer wrongly
    root: path.resolve(__dirname)
  }
};
