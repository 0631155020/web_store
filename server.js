const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '')));

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
