import app from "./app.js"
import logger from "./config/logger.js";

import { config } from "./config/config.js";
import { connectDB } from "./config/db.js";

await connectDB();

app.listen(config.PORT, () => {
  logger.info(`Server is running on port ${config.PORT}`);
});