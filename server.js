import express from "express";
import bodyParser from "body-parser";
import Routes from "./route-config.js";
const app = express();
export const PORT = 6969;

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
new Routes(app);

app.listen(PORT, () => {
  console.log(`listening on port: ${PORT}`);
});
