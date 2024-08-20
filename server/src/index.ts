const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World');
});

// For Getting THe Images
app.use('/images', express.static('images'));

//Create an Album/Trip

// Trip has multiple images

//Trip Has multiple Vector routes

//Add Routes to Trip

//Create Image For Trip

// For Getting MetaData of the Images
app.use('/api/v1/images', (req, res) => {
  //
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
