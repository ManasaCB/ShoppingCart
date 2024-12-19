1) There 3 tables in my database (PostgreSQL):
i) item_master (with columns id, item_name, unit and price)
ii) shopping_cart (with columns id, customer_name)
iii) shopping_cart_items (shopping_cart_id, item_id, qty)
	shopping_cart_id is foreign key to shopping_cart  table
	item_id is foreign key to item_master table

2) Creating APIs using Node.js for CRUD (Create, Read, Update and Delete) operations for items in a shopping cart. 
I.e. there should be separate APIs for the following calls:
List all items in the shopping cart (initially it will be empty)
Add an item to the shopping cart
View details of one item in the shopping cart
Update an item in the shopping cart
Delete an item in the shopping cart

3) Creating screens using React JS - to list the items in a shopping cart.

