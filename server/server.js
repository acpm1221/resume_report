require("dotenv").config();
const app = require("./src/app");
const conectDb = require("./src/config/dataBase");

conectDb();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});