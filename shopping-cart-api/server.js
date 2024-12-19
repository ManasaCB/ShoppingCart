const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const cors = require("cors");

// Initialize Express app
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// PostgreSQL Connection Pool
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "TestDB",
  password: "1234", // Replace with your PostgreSQL password
  port: 5432,
});

// Helper function to calculate "value" field
const calculateValue = (qty, price) => qty * price;

// API: List all items in the shopping cart
app.get("/shoppingcart/:cartId/items", async (req, res) => {
  const { cartId } = req.params;
  try {
    const query = `
      SELECT sci.item_id, im.item_name, im.unit, im.price, sci.qty, 
             (sci.qty * im.price) AS value
      FROM shopping_cart_items sci
      JOIN item_master im ON sci.item_id = im.id
      WHERE sci.shopping_cart_id = $1;
    `;
    const result = await pool.query(query, [cartId]);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching items" });
  }
});

// API: Add an item to the shopping cart
app.post("/shoppingcart/:cartId/item", async (req, res) => {
  const { cartId } = req.params;
  const { item_id, qty } = req.body;

  // Validate input
  if (!item_id || qty <= 0) {
    return res.status(400).json({ error: "Invalid item ID or quantity." });
  }

  console.log(`Adding item: cartId=${cartId}, item_id=${item_id}, qty=${qty}`);

  try {
    // Check if the item already exists
    const checkQuery = `
      SELECT * FROM shopping_cart_items 
      WHERE shopping_cart_id = $1 AND item_id = $2;
    `;
    const checkResult = await pool.query(checkQuery, [cartId, item_id]);
    console.log("Check result:", checkResult.rows);

    if (checkResult.rows.length > 0) {
      console.log("Item already exists in the cart.");
      return res
        .status(400)
        .json({ error: "Item already exists. Use update to change quantity." });
    }

    // Insert the item into the cart
    const insertQuery = `
      INSERT INTO shopping_cart_items (shopping_cart_id, item_id, qty)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const insertResult = await pool.query(insertQuery, [cartId, item_id, qty]);
    console.log("Insert result:", insertResult.rows[0]);

    return res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    console.error("Error adding item:", err.message);
    return res.status(500).json({ error: "Error adding item" });
  }
});

// app.post("/shoppingcart/:cartId/item", async (req, res) => {
//   const { cartId } = req.params;
//   const { item_id, qty } = req.body;
//   if (!item_id || qty <= 0) {
//     return res.status(400).json({ error: "Invalid item ID or quantity." });
//   }

//   try {
//     // Check if item already exists in the cart
//     const existing = await pool.query(
//       "SELECT qty FROM shopping_cart_items WHERE shopping_cart_id = $1 AND item_id = $2",
//       [cartId, item_id]
//     );

//     if (existing.rowCount > 0) {
//       return res
//         .status(400)
//         .json({ error: "Item already exists. Use update to change quantity." });
//     }

//     // Insert new item
//     const insertQuery = `
//       INSERT INTO shopping_cart_items (shopping_cart_id, item_id, qty)
//       VALUES ($1, $2, $3) RETURNING *;
//     `;
//     const result = await pool.query(insertQuery, [cartId, item_id, qty]);
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: "Error adding item" });
//   }
// });

// API: View details of one item in the shopping cart
app.get("/shoppingcart/:cartId/item/:itemId", async (req, res) => {
  const { cartId, itemId } = req.params;

  try {
    const query = `
      SELECT sci.item_id, im.item_name, im.unit, im.price, sci.qty,
             (sci.qty * im.price) AS value
      FROM shopping_cart_items sci
      JOIN item_master im ON sci.item_id = im.id
      WHERE sci.shopping_cart_id = $1 AND sci.item_id = $2;
    `;
    const result = await pool.query(query, [cartId, itemId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error fetching item details" });
  }
});

// API: Update an item in the shopping cart
app.put("/shoppingcart/:cartId/item/:itemId", async (req, res) => {
  const { cartId, itemId } = req.params;
  const { qty } = req.body;

  if (qty <= 0) {
    return res.status(400).json({ error: "Quantity must be greater than 0" });
  }

  try {
    const updateQuery = `
      UPDATE shopping_cart_items
      SET qty = $1
      WHERE shopping_cart_id = $2 AND item_id = $3
      RETURNING *;
    `;
    const result = await pool.query(updateQuery, [qty, cartId, itemId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error updating item" });
  }
});

// API: Delete an item in the shopping cart
app.delete("/shoppingcart/:cartId/item/:itemId", async (req, res) => {
  const { cartId, itemId } = req.params;

  try {
    const deleteQuery = `
      DELETE FROM shopping_cart_items
      WHERE shopping_cart_id = $1 AND item_id = $2
      RETURNING *;
    `;
    const result = await pool.query(deleteQuery, [cartId, itemId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting item" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


// const express = require('express'); 
// const { Client } = require('pg'); // import postgresql_client from pg package
// const app = express();
// const port = 3000;//port where the server will listen for the request
// const cors = require('cors');
// app.use(cors());  
// app.use(express.json());//to use json data from postman

// // PostgreSQL connection
// const client = new Client({  //new object
//   user: 'postgres',
//   host: 'localhost',
//   database: 'TestDB',
//   password: '1234',
//   port: 5432,
// });

// client.connect()//connects
//   .then(() => console.log("Connected to PostgreSQL"))
//   .catch((err) => console.error("Connection error", err.stack));

// // Home route (root path)
// app.get('/', (req, res) => {
//   res.send('Welcome to the Shopping Cart API!');
// });

// // API Endpoints

// // 1. List all items in the shopping cart (initially empty)
// app.get('/shoppingcart/99/items', async (req, res) => {
//   try {
//     const result = await client.query(`
//       SELECT si.id, im.item_name, si.qty, im.price, (si.qty * im.price) as total_price
//       FROM shopping_cart_items si
//       JOIN item_master im ON si.item_id = im.id`);
//     res.json(result.rows);//query result given as json response
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error fetching shopping cart items");
//   }
// });

// // 2. Add an item to the shopping cart
// app.post('/shoppingcart/99/item', async (req, res) => {
//   const { item_id, qty } = req.body;

//   if (qty <= 0) {
//     return res.status(400).json({ error: "Quantity must be greater than 0" });
//   }

//   try {
//     const item = await pool.query("SELECT * FROM item_master WHERE id = $1", [item_id]);

//     if (item.rows.length === 0) {
//       return res.status(404).json({ error: "Item not found" });
//     }

//     const existingItem = await pool.query(
//       "SELECT * FROM shopping_cart_items WHERE item_id = $1",
//       [item_id]
//     );

//     if (existingItem.rows.length > 0) {
//       return res.status(400).json({ error: "Item already in cart. Update quantity instead." });
//     }

//     await pool.query(
//       "INSERT INTO shopping_cart_items (item_id, qty) VALUES ($1, $2)",
//       [item_id, qty]
//     );

//     res.status(201).json({ message: "Item added to cart" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // // 2. Add an item to the shopping cart to not add an item more than once 
// // app.post('/shoppingcart/99/item', async (req, res) => {
// //     const { item_id, qty } = req.body;
// //     if (!item_id || qty <= 0) {
// //       return res.status(400).send("Invalid item or quantity");
// //     }
  
// //     try {
// //       // Check if item exists in the shopping cart
// //       const cartItemResult = await client.query('SELECT * FROM shopping_cart_items WHERE item_id = $1 AND cart_id = 99', [item_id]);
      
// //       if (cartItemResult.rows.length > 0) {
// //         // Item already exists in the cart, so we update the quantity
// //         const existingItem = cartItemResult.rows[0];
// //         const updatedQty = existingItem.qty + qty; // Increase the existing quantity
  
// //         const updateResult = await client.query('UPDATE shopping_cart_items SET qty = $1 WHERE id = $2 RETURNING *', [updatedQty, existingItem.id]);
// //         return res.json(updateResult.rows[0]); // Return updated item
// //       }
  
// //       // If the item doesn't exist, insert the item into the shopping cart
// //       const itemResult = await client.query('SELECT * FROM item_master WHERE id = $1', [item_id]);
// //       if (itemResult.rows.length === 0) {
// //         return res.status(404).send("Item not found");
// //       }
  
// //       // Insert the item into the shopping cart
// //       const insertResult = await client.query('INSERT INTO shopping_cart_items (item_id, qty, cart_id) VALUES ($1, $2, 99) RETURNING *', [item_id, qty]);
// //       res.status(201).json(insertResult.rows[0]); // Return the inserted item
// //     } catch (err) {
// //       console.error(err);
// //       res.status(500).send("Error adding item to shopping cart");
// //     }
// //   });
  

// // 3. View details of one item in the shopping cart
// app.get('/shoppingcart/99/item/:id', async (req, res) => {
//   const itemId = req.params.id;
//   try {
//     const result = await client.query(`
//       SELECT si.id, im.item_name, si.qty, im.price, (si.qty * im.price) as total_price
//       FROM shopping_cart_items si
//       JOIN item_master im ON si.item_id = im.id
//       WHERE si.id = $1`, [itemId]);
//     if (result.rows.length === 0) {
//       return res.status(404).send("Item not found");
//     }
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error fetching item details");
//   }
// });

// // 4. Update an item in the shopping cart
// app.put('/shoppingcart/99/item/:id', async (req, res) => {
//   const itemId = req.params.id;
//   const { qty } = req.body;
//   if (qty <= 0) {
//     return res.status(400).send("Invalid quantity");
//   }
//   try {
//     // Update item in shopping cart items
//     const updateResult = await client.query('UPDATE shopping_cart_items SET qty = $1 WHERE id = $2 RETURNING *', [qty, itemId]);
//     if (updateResult.rows.length === 0) {
//       return res.status(404).send("Item not found");
//     }
//     res.json(updateResult.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error updating item");
//   }
// });

// // 5. Delete an item from the shopping cart
// app.delete('/shoppingcart/99/item/:id', async (req, res) => {
//   const itemId = req.params.id;
//   try {
//     const deleteResult = await client.query('DELETE FROM shopping_cart_items WHERE id = $1 RETURNING *', [itemId]);
//     if (deleteResult.rows.length === 0) {
//       return res.status(404).send("Item not found");
//     }
//     res.json({ message: "Item deleted" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error deleting item");
//   }
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });
