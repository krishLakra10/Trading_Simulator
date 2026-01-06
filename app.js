const express = require('express');
const app = express();
app.use(express.json());
app.set('view engine' , 'ejs');
const path = require('path');
app.set('views', path.join(__dirname, 'views'));
const errorHandler = require('./middlewares/error.middleware');


//Mongoose Connection
const mongoose = require('mongoose');

async function main(){
    await mongoose.connect('mongodb://localhost:27017/trading_simulator');
}
main()
    .then(() => console.log("✅ Mongo Connection Open"))
    .catch(err => console.log("❌ Mongo Connection Error:", err));

const port = 8080;

app.listen(port , () => {
    console.log(`Server is running on http://localhost:${port}`);
});



//Routes
const authRoutes = require('./routes/auth.routes');
const portfolioRoutes = require('./routes/portfolio.routes');

app.use('/auth', authRoutes);
app.use('/portfolio', portfolioRoutes);



app.get('/' , (req , res) => {
    res.render('home');
});

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});
app.use(errorHandler);

app.use((req ,res) => {
    console.log(`request recieved`)
})
