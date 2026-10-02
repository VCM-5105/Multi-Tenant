import "dotenv/config";
import app from "./app.js";
import { testConnection } from "./config/db.js";

// dotenv.config({
//   path:'.env'
// });

const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;

const startServer = async () => {
  await testConnection();

  app.listen(PORT, () => {
    console.log(`[SERVER] Backend running in ${NODE_ENV} mode on port ${PORT}`);
    console.log(
      `[SERVER] Health check URL: http://localhost:${PORT}/api/v1/health`,
    );
  });
};

startServer();
