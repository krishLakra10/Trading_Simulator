const express = require('express');
const app = express();

const port = 8080;

app.listen(port , () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.get('/' , (req , res) => {
    res.send('Welcome to the Trading Simulator API');
});
app.use((req ,res) => {
    console.log(`request recieved`)
})
