const express = require('express');
const mysql = require('mysql2');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
const path=require('path');
app.set('view engine','ejs')
// Database configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port:3306,
    database: 'home'
  });


  db.connect((err) => {
    if (err) {
      console.error('Error connecting to database:', err);
    } else {
      console.log('Connected to database');
    }
  });
  app.get('/', (req, res) => {
    res.render('login');

      });
      app.get('/login', (req, res) => {
        res.render('login');
    
          });
  app.post('/login', (req, res) => {
    const { User_name, Password } = req.body;
  
    const query = 'SELECT * FROM user WHERE User_name = ? AND Password = ?';
    db.query(query, [User_name, Password], (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.sendStatus(500)

      } else if (results.length > 0) {
        res.send(`
        <script>
          alert("Login Successfully!");
          window.location.href = "/dash"; // Redirect back to the form
        </script>
      `);
      }else{
        res.send(`
        <script>
          alert("Invalid User Password");
          window.location.href = "/"; // Redirect back to the form
        </script>
      `);        }
      })
    });

  global.myarray=[]
  app.get('/dash', (req, res) => {
       db.query('SELECT count(City) FROM city', function(err,result,fields){
      if (err){
        console.log(err)
      }else{
        const countCity = result[0]['count(City)'];
        
        //console.log(countCity)
        global.myarray.push(countCity)
      }
    })

    db.query('SELECT count(Property_ID) FROM property', function(err,result,fields){
      if (err){
        console.log(err)
      }else{
        const countProperty = result[0]['count(Property_ID)'];
        
        global.myarray.push(countProperty)
      }
    })

    db.query('SELECT count(UserID) FROM user', function(err,result,fields){
      if (err){
        console.log(err)
      }else{
        const countUserID = result[0]['count(UserID)'];
        

        //const views=['countCity','countUserID','countProperty'];
        
        //console.log(countUserID)
        global.myarray.push(countUserID)
      }});
        //console.log(global.myarray);
        res.render('dash2',{myarray})
       });



  app.get('/add', (req, res) => {
        res.render('add');
    
          });
  app.get('/search', (req, res) => {
            res.render('search');
          });    

      //generate a unique user ID
const Property_ID =generateProperty_Id();
const Requirements_ID=generateRequirements_ID();
const Property_Id2 =generateProperty_Id();
const Property_Id3 =generateProperty_Id();
const Property_Id4 =generateProperty_Id();



function generateProperty_Id() {
  return Math.floor(Math.random() * 1000000).toString();
};

function generateRequirements_ID() {
  return Math.floor(Math.random() * 1000000).toString();
};
const Property_ID3=generateRequirements_ID();
const City_ID=generateProperty_Id();
// Render the EJS template with city data from the database
app.get('/city', (req, res) => {
  const sqlQuery = 'SELECT * FROM city';
  db.query(sqlQuery, (error, results) => {
    if (error) {
      throw error;
    } else {
      res.render('city', { city: results });
    }
  });
});

// API endpoint to add a city to the database
app.post('/add', (req, res) => {
  const { City, Status } = req.body;
  const sql = 'INSERT INTO city (City_ID,City, Status) VALUES (?, ?,?)';
  db.query(sql, [City_ID,City, Status], (err, result) => {
    if (err) {
      throw err;
    }
    res.redirect('/city');
  });
});



app.get('/view_prop/:Property_ID', (req, res) => {
  const Property_ID=req.params.Property_ID;
  const sql = 'SELECT Property_ID,Timestamp,Description,Address,Landmark,Construction_Status,Superbuiltup_area,Carpet_area,Bedrooms,Bathrooms,Total_floors FROM property where Property_ID=?';
  db.query(sql,[Property_ID], (err, results) => {
    if (err) {
      throw err;
    }
    const item=results[0];
    res.render('view', { items: results });
  });
});


app.get('/edit/:City_ID', (req, res) => {
  const City_ID = req.params.City_ID;
  const sql = 'SELECT * FROM city WHERE City_ID = ?';
  db.query(sql, [City_ID], (err, result) => {
    if (err) {
      throw err;
    }
    const item = result[0];
    res.render('edit_city', { item });
  });
});

// Update an existing item
app.post('/update/:City_ID', (req, res) => {
  const City_ID = req.params.City_ID;
  const { City, Status } = req.body;
  const sql = 'UPDATE city SET City = ?, Status = ? WHERE City_ID = ?';
  db.query(sql, [City, Status,City_ID], (err, result) => {
    if (err) {
      throw err;
    }
    res.redirect('/city');
  });
});

// Delete an item
app.post('/delete/:City_ID', (req, res) => {
  const City_ID = req.params.City_ID;
  const sql = 'DELETE FROM city WHERE City_ID = ?';
  db.query(sql, [City_ID], (err, result) => {
    if (err) {
      throw err;
    }
    res.redirect('/city');
  });
});


app.get('/list', (req, res) => {
  const sqlQuery = 'SELECT Property_ID,Title,Property_Category,Property_Nature,City,Price FROM property';
  db.query(sqlQuery, (error, results) => {
    if (error) {
      res.send('Error fetching data from the database.');
    } else {
      res.render('list',{property: results });
    }
  });
});

app.post('/add_prop', (req, res) => {
  const {Title,Property_Category,Property_Nature,City,Price } = req.body;
  const sql = 'INSERT INTO property (Property_ID,Title,Property_Category,Property_Nature,City,Price) VALUES (?, ?,?,?,?,?)';
  db.query(sql, [Property_ID,Title,Property_Category,Property_Nature,City,Price], (err, result) => {
    if (err) {
      throw err;
    }
    res.redirect('/list');
  });
});



app.get('/edit_prop/:Property_ID', (req, res) => {
  const Property_ID = req.params.Property_ID;
  const sql = 'SELECT Property_ID,Title,Property_Category,Property_Nature,City,Price FROM property WHERE Property_ID = ?';
  db.query(sql, [Property_ID], (err, result) => {
    if (err) {
      throw err;
    }
    const item = result[0];
    res.render('edit_Property', { item });
  });
});


// Update an existing item
app.post('/update_prop/:Property_ID', (req, res) => {
  const Property_ID = req.params.Property_ID;
  const {Title,Property_Category,Property_Nature,City,Price} = req.body;
  const sql = 'UPDATE property SET Title = ?, Property_Category = ?,Property_Nature = ?,City = ?,Price = ? WHERE Property_ID = ?';
  db.query(sql, [Title,Property_Category,Property_Nature,City,Price,Property_ID], (err, result) => {
    if (err) {
      throw err;
    }
    res.redirect('/list');
  });
});

// Delete an item
app.post('/delete_prop/:Property_ID', (req, res) => {
  const Property_ID = req.params.Property_ID;
  const sql = 'DELETE FROM property WHERE Property_ID = ?';
  db.query(sql, [Property_ID], (err, result) => {
    if (err) {
      throw err;
    }
    res.redirect('/list');
  });
});

app.get('/dash2', (req, res) => {
  res.render('dash2');
});



app.get('/upload', (req, res) => {
  res.render('upload');
});

// Route to handle the image upload
app.post('/upload', upload.single('image'), (req, res) => {
  const imageFile = req.file;

  if (!imageFile) {
    res.send('Please select an image file.');
  } else {
    // You can store the image details in the database here
    const imageUrl = imageFile.path; // Path where the image is temporarily stored

    // Example: Insert image URL into the database
    const sqlQuery = 'INSERT INTO images (url) VALUES (?)';
    db.query(sqlQuery, [imageUrl], (error, result) => {
      if (error) {
        res.send('Error storing image in the database.');
      } else {
        res.send(`
        <script>
          alert("Uploaded successfully!");
          window.location.href = "/add2"; // Redirect back to the form
        </script>
      `);      }
    });
  }
});

      app.post('/submit_property', (req, res) => {
        const { Title,Property_Category,Cause,Property_Type,City } = req.body;
      
        // Insert data into the database
        const query = 'INSERT INTO property(Property_Id,Title,Property_Category,Cause,Property_Type,City) VALUES (?,?,?,?, ?,?)';
        const values=[Property_Id2,Title,Property_Category,Cause,Property_Type,City];
        db.query(query, values, (err, result) => {
          if (err) {
            console.error('Error inserting data into database:', err);
            res.status(500).send('Error inserting data into database.');
            return;
          } else {
           // res.send('Data submitted successfully!');
           res.send(`
        <script>
          alert("Data submitted successfully!");
          window.location.href = "/upload"; // Redirect back to the form
        </script>
      `); 
          }
        });
      });

      app.get('/add2', (req, res) => {
        res.render('add2');
      });
      app.post('/submit_property2', (req, res) => {
        const {Address,Landmark,Locality } = req.body;
      
        // Insert data into the database
        const query = 'INSERT INTO property(Property_ID,Address,Landmark,Locality) VALUES (?, ?,?,?)';
        const values=[Property_Id3,Address,Landmark,Locality];
        db.query(query, values, (err, result) => {
          if (err) {
            console.error('Error inserting data into database:', err);
            res.status(500).send('Error inserting data into database.');
            return;
          } else {
            res.send(`
        <script>
          alert("Data submitted successfully!");
          window.location.href = "/add3"; // Redirect back to the form
        </script>
      `); 
            //res.send('Data submitted successfully!');

          }
        });
      });



      app.get('/add3', (req, res) => {
        res.render('add3');
      });


      app.post('/submit_property3', (req, res) => {
        const {Bedrooms,Bathrooms,Balconies,Price,Total_floors,Furnishing_Status } = req.body;
      
        // Insert data into the database
        const query = 'INSERT INTO property(Property_ID,Bedrooms,Bathrooms,Balconies,Price,Total_floors,Furnishing_Status) VALUES (?, ?,?,?,?,?,?)';
        const values=[Property_Id4,Bedrooms,Bathrooms,Balconies,Price,Total_floors,Furnishing_Status];
        db.query(query, values, (err, result) => {
          if (err) {
            console.error('Error inserting data into database:', err);
            res.status(500).send('Error inserting data into database.');
            return;
          } else {
            {
              res.send(`
              <script>
                alert("Thank you for Submitting!");
                window.location.href = "/dash"; // Redirect back to the form
              </script>
            `);         
        }}
        ;
      });
    });

      app.post('/search', (req, res) => {
        const {Property_Category, Property_Nature,Property_Type,City,Budget_From,Budget_To} = req.body;
      
        // Insert data into the database
        const query = 'INSERT INTO requirements(Requirements_ID,Property_Category,Property_Nature,Property_Type,City,Budget_From,Budget_To) VALUES (?,?,?,?,?, ?, ?)';
        const values=[Requirements_ID,Property_Category,Property_Nature,Property_Type,City,Budget_From,Budget_To];
        db.query(query, values, (err, result) => {
          if (err) {
            console.error('Error inserting data into database:', err);
            res.status(500).send('Error inserting data into database.');
            return;
          } else {
            {
              res.send(`
              <script>
                alert("Submitted Successfully!");
                window.location.href = "/search"; // Redirect back to the form
              </script>
            `);         
        }        };
      });
    });
  // Start the server
  const port = 7000;
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });