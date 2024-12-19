import React, { useState, useEffect } from "react";
import axios from "axios";

const ShoppingCart = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ item_id: "", qty: 1 });
  const [editItem, setEditItem] = useState(null);
  const [error, setError] = useState(""); // New state for error messages

  //1. Fetch the list of items in the shopping cart
  useEffect(() => {
    axios
      .get("http://localhost:3000/shoppingcart/99/items")
      .then((response) => {
        setItems(response.data);
      })
      .catch((error) => setError("Error fetching items."));
  }, []);

  //2. Handle item selection for adding to cart
  const handleAddItem = () => {
    setError(""); // Clear any previous error messages
  
    // Validate item ID and quantity
    if (!newItem.item_id || newItem.qty <= 0) {
      setError("Please enter a valid item and quantity.");
      return;
    }
  
    // Check if the item is already in the cart
    const existingItem = items.find((item) => item.item_id === newItem.item_id);
  
    if (existingItem) {
      // Show message that the item already exists in the cart
      setError("Item already exists in the cart. Use update to change quantity.");
      return; // Don't proceed further, since we're not adding a new item
    }
  
    // If the item doesn't exist, proceed with adding it
    axios
      .post("http://localhost:3000/shoppingcart/99/item", newItem)
      .then((response) => {
        setItems([...items, response.data]); // Add the new item to the cart
        setNewItem({ item_id: "", qty: 1 }); // Reset the form
      })
      .catch((error) => {
        if (error.response && error.response.data.error) {
          setError(error.response.data.error); // Show specific error message
        } else {
          setError("Unexpected error occurred while adding the item.");
        }
      });
  };
  
  //3. Handle edit item
  const handleEditItem = () => {
    setError(""); 
    if (editItem.qty <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }
    axios
      .put(`http://localhost:3000/shoppingcart/99/item/${editItem.id}`, { qty: editItem.qty })
      .then((response) => {
        const updatedItems = items.map((item) =>
          item.id === response.data.id ? response.data : item
        );
        setItems(updatedItems);
        setEditItem(null);
      })
      .catch((error) => setError("Error updating item."));
  };

  //4. Handle delete item
  const handleDeleteItem = (id) => {
    setError(""); // Clear any previous error messages
    axios
      .delete(`http://localhost:3000/shoppingcart/99/item/${id}`)
      .then(() => {
        setItems(items.filter((item) => item.id !== id));
      })
      .catch((error) => setError("Error deleting item."));
  };

  return (
    <div>
      <h1>Shopping Cart</h1>

      {/* Error Message */}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {/* List of Items in the Shopping Cart */}
      <table border="1" width="80%" cellPadding="10">
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.item_name}</td>
              <td>{item.qty}</td>
              <td>{item.price}</td>
              <td>{item.qty * item.price}</td>
              <td>
                <button onClick={() => setEditItem(item)}>Edit</button>
                <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Form for Adding or Editing Items */}
      <h2>{editItem ? "Edit Item" : "Add Item to Cart"}</h2>
      <div>
        <label>Item ID: </label>
        <input
          type="number"
          value={editItem ? editItem.item_id : newItem.item_id}
          onChange={(e) =>
            editItem
              ? setEditItem({ ...editItem, item_id: e.target.value })
              : setNewItem({ ...newItem, item_id: e.target.value })
          }
        />
      </div>
      <div>
        <label>Quantity: </label>
        <input
          type="number"
          value={editItem ? editItem.qty : newItem.qty}
          onChange={(e) =>
            editItem
              ? setEditItem({ ...editItem, qty: e.target.value })
              : setNewItem({ ...newItem, qty: e.target.value })
          }
        />
      </div>

      {editItem ? (
        <button onClick={handleEditItem}>Save Changes</button>
      ) : (
        <button onClick={handleAddItem}>Add Item</button>
      )}
    </div>
  );
};

export default ShoppingCart;
