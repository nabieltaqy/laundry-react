package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	_ "modernc.org/sqlite"
)

type app struct {
	db *sql.DB
}

type customer struct {
	ID        int64   `json:"id"`
	Name      string  `json:"name"`
	Phone     string  `json:"phone"`
	Email     *string `json:"email,omitempty"`
	Address   *string `json:"address,omitempty"`
	CreatedAt string  `json:"created_at"`
	UpdatedAt string  `json:"updated_at"`
}

type item struct {
	ID          int64   `json:"id"`
	Name        string  `json:"name"`
	Type        string  `json:"type"`
	Price       float64 `json:"price"`
	Description *string `json:"description,omitempty"`
	CreatedAt   string  `json:"created_at"`
	UpdatedAt   string  `json:"updated_at"`
}

type order struct {
	ID         int64   `json:"id"`
	CustomerID int64   `json:"customer_id"`
	Status     string  `json:"status"`
	TotalPrice float64 `json:"total_price"`
	Notes      *string `json:"notes,omitempty"`
	CreatedAt  string  `json:"created_at"`
	UpdatedAt  string  `json:"updated_at"`
}

type transaction struct {
	ID            int64   `json:"id"`
	OrderID       *int64  `json:"order_id,omitempty"`
	Amount        float64 `json:"amount"`
	PaymentMethod *string `json:"payment_method,omitempty"`
	Status        string  `json:"status"`
	Notes         *string `json:"notes,omitempty"`
	CreatedAt     string  `json:"created_at"`
	UpdatedAt     string  `json:"updated_at"`
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbPath := os.Getenv("DATABASE_URL")
	if dbPath == "" {
		dbPath = "laundry.db"
	}

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatalf("open db: %v", err)
	}

	if err := initSchema(db); err != nil {
		log.Fatalf("init schema: %v", err)
	}

	app := &app{db: db}

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(corsMiddleware)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	r.Route("/customers", func(r chi.Router) {
		r.Get("/", app.listCustomers)
		r.Post("/", app.createCustomer)
		r.Route("/{id}", func(r chi.Router) {
			r.Get("/", app.getCustomer)
			r.Put("/", app.updateCustomer)
			r.Delete("/", app.deleteCustomer)
		})
	})

	r.Route("/items", func(r chi.Router) {
		r.Get("/", app.listItems)
		r.Post("/", app.createItem)
		r.Route("/{id}", func(r chi.Router) {
			r.Get("/", app.getItem)
			r.Put("/", app.updateItem)
			r.Delete("/", app.deleteItem)
		})
	})

	r.Route("/orders", func(r chi.Router) {
		r.Get("/", app.listOrders)
		r.Post("/", app.createOrder)
		r.Route("/{id}", func(r chi.Router) {
			r.Get("/", app.getOrder)
			r.Put("/", app.updateOrder)
			r.Delete("/", app.deleteOrder)
		})
	})

	r.Route("/transactions", func(r chi.Router) {
		r.Get("/", app.listTransactions)
		r.Post("/", app.createTransaction)
		r.Route("/{id}", func(r chi.Router) {
			r.Get("/", app.getTransaction)
			r.Put("/", app.updateTransaction)
			r.Delete("/", app.deleteTransaction)
		})
	})

	r.Route("/analytics", func(r chi.Router) {
		r.Get("/total-revenue", app.getTotalRevenue)
		r.Get("/total-orders", app.getTotalOrders)
	})

	log.Printf("Go API listening on :%s using %s", port, dbPath)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("server error: %v", err)
	}
}

func initSchema(db *sql.DB) error {
	schema := []string{
		`CREATE TABLE IF NOT EXISTS customers (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			phone TEXT NOT NULL,
			email TEXT,
			address TEXT,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS items (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			type TEXT NOT NULL,
			price REAL NOT NULL,
			description TEXT,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS orders (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			customer_id INTEGER NOT NULL,
			status TEXT DEFAULT 'pending',
			total_price REAL DEFAULT 0,
			notes TEXT,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS transactions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			order_id INTEGER,
			amount REAL NOT NULL,
			payment_method TEXT,
			status TEXT DEFAULT 'completed',
			notes TEXT,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT DEFAULT CURRENT_TIMESTAMP
		);`,
	}

	for _, stmt := range schema {
		if _, err := db.Exec(stmt); err != nil {
			return err
		}
	}

	return nil
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func parseID(r *http.Request) (int64, error) {
	idStr := chi.URLParam(r, "id")
	return strconv.ParseInt(idStr, 10, 64)
}

func (a *app) listCustomers(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.Query(`SELECT id, name, phone, email, address, created_at, updated_at FROM customers ORDER BY id DESC`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var result []customer
	for rows.Next() {
		var c customer
		var email sql.NullString
		var address sql.NullString
		if err := rows.Scan(&c.ID, &c.Name, &c.Phone, &email, &address, &c.CreatedAt, &c.UpdatedAt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if email.Valid {
			c.Email = &email.String
		}
		if address.Valid {
			c.Address = &address.String
		}
		result = append(result, c)
	}

	writeJSON(w, http.StatusOK, result)
}

func (a *app) getCustomer(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	c, err := a.fetchCustomer(id)
	if err != nil {
		handleFetchError(w, err, "customer")
		return
	}

	writeJSON(w, http.StatusOK, c)
}

func (a *app) createCustomer(w http.ResponseWriter, r *http.Request) {
	var payload customer
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}
	if payload.Name == "" || payload.Phone == "" {
		http.Error(w, "name and phone are required", http.StatusBadRequest)
		return
	}

	res, err := a.db.Exec(
		`INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)`,
		payload.Name,
		payload.Phone,
		payload.Email,
		payload.Address,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	id, _ := res.LastInsertId()
	c, err := a.fetchCustomer(id)
	if err != nil {
		handleFetchError(w, err, "customer")
		return
	}
	writeJSON(w, http.StatusCreated, c)
}

func (a *app) updateCustomer(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	var payload customer
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}
	if payload.Name == "" || payload.Phone == "" {
		http.Error(w, "name and phone are required", http.StatusBadRequest)
		return
	}

	_, err = a.db.Exec(
		`UPDATE customers SET name = ?, phone = ?, email = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
		payload.Name,
		payload.Phone,
		payload.Email,
		payload.Address,
		id,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	c, err := a.fetchCustomer(id)
	if err != nil {
		handleFetchError(w, err, "customer")
		return
	}
	writeJSON(w, http.StatusOK, c)
}

func (a *app) deleteCustomer(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	if _, err := a.db.Exec(`DELETE FROM customers WHERE id = ?`, id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (a *app) listItems(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.Query(`SELECT id, name, type, price, description, created_at, updated_at FROM items ORDER BY id DESC`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var result []item
	for rows.Next() {
		var it item
		var description sql.NullString
		if err := rows.Scan(&it.ID, &it.Name, &it.Type, &it.Price, &description, &it.CreatedAt, &it.UpdatedAt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if description.Valid {
			it.Description = &description.String
		}
		result = append(result, it)
	}

	writeJSON(w, http.StatusOK, result)
}

func (a *app) getItem(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	it, err := a.fetchItem(id)
	if err != nil {
		handleFetchError(w, err, "item")
		return
	}

	writeJSON(w, http.StatusOK, it)
}

func (a *app) createItem(w http.ResponseWriter, r *http.Request) {
	var payload item
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}
	if payload.Name == "" || payload.Type == "" {
		http.Error(w, "name and type are required", http.StatusBadRequest)
		return
	}

	res, err := a.db.Exec(
		`INSERT INTO items (name, type, price, description) VALUES (?, ?, ?, ?)`,
		payload.Name,
		payload.Type,
		payload.Price,
		payload.Description,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	id, _ := res.LastInsertId()
	it, err := a.fetchItem(id)
	if err != nil {
		handleFetchError(w, err, "item")
		return
	}
	writeJSON(w, http.StatusCreated, it)
}

func (a *app) updateItem(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	var payload item
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}
	if payload.Name == "" || payload.Type == "" {
		http.Error(w, "name and type are required", http.StatusBadRequest)
		return
	}

	_, err = a.db.Exec(
		`UPDATE items SET name = ?, type = ?, price = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
		payload.Name,
		payload.Type,
		payload.Price,
		payload.Description,
		id,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	it, err := a.fetchItem(id)
	if err != nil {
		handleFetchError(w, err, "item")
		return
	}
	writeJSON(w, http.StatusOK, it)
}

func (a *app) deleteItem(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	if _, err := a.db.Exec(`DELETE FROM items WHERE id = ?`, id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (a *app) listOrders(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.Query(`SELECT id, customer_id, status, total_price, notes, created_at, updated_at FROM orders ORDER BY id DESC`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var result []order
	for rows.Next() {
		var o order
		var notes sql.NullString
		if err := rows.Scan(&o.ID, &o.CustomerID, &o.Status, &o.TotalPrice, &notes, &o.CreatedAt, &o.UpdatedAt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if notes.Valid {
			o.Notes = &notes.String
		}
		result = append(result, o)
	}

	writeJSON(w, http.StatusOK, result)
}

func (a *app) getOrder(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	o, err := a.fetchOrder(id)
	if err != nil {
		handleFetchError(w, err, "order")
		return
	}

	writeJSON(w, http.StatusOK, o)
}

func (a *app) createOrder(w http.ResponseWriter, r *http.Request) {
	var payload order
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}
	if payload.CustomerID == 0 {
		http.Error(w, "customer_id is required", http.StatusBadRequest)
		return
	}
	if payload.Status == "" {
		payload.Status = "pending"
	}

	res, err := a.db.Exec(
		`INSERT INTO orders (customer_id, status, total_price, notes) VALUES (?, ?, ?, ?)`,
		payload.CustomerID,
		payload.Status,
		payload.TotalPrice,
		payload.Notes,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	id, _ := res.LastInsertId()
	o, err := a.fetchOrder(id)
	if err != nil {
		handleFetchError(w, err, "order")
		return
	}
	writeJSON(w, http.StatusCreated, o)
}

func (a *app) updateOrder(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	var payload order
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}
	if payload.CustomerID == 0 {
		http.Error(w, "customer_id is required", http.StatusBadRequest)
		return
	}
	if payload.Status == "" {
		payload.Status = "pending"
	}

	_, err = a.db.Exec(
		`UPDATE orders SET customer_id = ?, status = ?, total_price = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
		payload.CustomerID,
		payload.Status,
		payload.TotalPrice,
		payload.Notes,
		id,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	o, err := a.fetchOrder(id)
	if err != nil {
		handleFetchError(w, err, "order")
		return
	}
	writeJSON(w, http.StatusOK, o)
}

func (a *app) deleteOrder(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	if _, err := a.db.Exec(`DELETE FROM orders WHERE id = ?`, id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (a *app) listTransactions(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.Query(`SELECT id, order_id, amount, payment_method, status, notes, created_at, updated_at FROM transactions ORDER BY id DESC`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var result []transaction
	for rows.Next() {
		var t transaction
		var orderID sql.NullInt64
		var paymentMethod sql.NullString
		var notes sql.NullString
		if err := rows.Scan(&t.ID, &orderID, &t.Amount, &paymentMethod, &t.Status, &notes, &t.CreatedAt, &t.UpdatedAt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if orderID.Valid {
			value := orderID.Int64
			t.OrderID = &value
		}
		if paymentMethod.Valid {
			t.PaymentMethod = &paymentMethod.String
		}
		if notes.Valid {
			t.Notes = &notes.String
		}
		result = append(result, t)
	}

	writeJSON(w, http.StatusOK, result)
}

func (a *app) getTransaction(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	t, err := a.fetchTransaction(id)
	if err != nil {
		handleFetchError(w, err, "transaction")
		return
	}

	writeJSON(w, http.StatusOK, t)
}

func (a *app) createTransaction(w http.ResponseWriter, r *http.Request) {
	var payload transaction
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}
	if payload.Amount == 0 {
		http.Error(w, "amount is required", http.StatusBadRequest)
		return
	}
	if payload.Status == "" {
		payload.Status = "completed"
	}

	var orderID any
	if payload.OrderID != nil {
		orderID = *payload.OrderID
	}

	res, err := a.db.Exec(
		`INSERT INTO transactions (order_id, amount, payment_method, status, notes) VALUES (?, ?, ?, ?, ?)`,
		orderID,
		payload.Amount,
		payload.PaymentMethod,
		payload.Status,
		payload.Notes,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	id, _ := res.LastInsertId()
	t, err := a.fetchTransaction(id)
	if err != nil {
		handleFetchError(w, err, "transaction")
		return
	}
	writeJSON(w, http.StatusCreated, t)
}

func (a *app) updateTransaction(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	var payload transaction
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}
	if payload.Amount == 0 {
		http.Error(w, "amount is required", http.StatusBadRequest)
		return
	}
	if payload.Status == "" {
		payload.Status = "completed"
	}

	var orderID any
	if payload.OrderID != nil {
		orderID = *payload.OrderID
	}

	_, err = a.db.Exec(
		`UPDATE transactions SET order_id = ?, amount = ?, payment_method = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
		orderID,
		payload.Amount,
		payload.PaymentMethod,
		payload.Status,
		payload.Notes,
		id,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	t, err := a.fetchTransaction(id)
	if err != nil {
		handleFetchError(w, err, "transaction")
		return
	}
	writeJSON(w, http.StatusOK, t)
}

func (a *app) deleteTransaction(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	if _, err := a.db.Exec(`DELETE FROM transactions WHERE id = ?`, id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (a *app) getTotalRevenue(w http.ResponseWriter, r *http.Request) {
	var total float64
	if err := a.db.QueryRow(`SELECT COALESCE(SUM(amount), 0) FROM transactions`).Scan(&total); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, map[string]float64{"total": total})
}

func (a *app) getTotalOrders(w http.ResponseWriter, r *http.Request) {
	var count int64
	if err := a.db.QueryRow(`SELECT COUNT(*) FROM orders`).Scan(&count); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, map[string]int64{"count": count})
}

func (a *app) fetchCustomer(id int64) (customer, error) {
	var c customer
	var email sql.NullString
	var address sql.NullString
	row := a.db.QueryRow(`SELECT id, name, phone, email, address, created_at, updated_at FROM customers WHERE id = ?`, id)
	if err := row.Scan(&c.ID, &c.Name, &c.Phone, &email, &address, &c.CreatedAt, &c.UpdatedAt); err != nil {
		return customer{}, err
	}
	if email.Valid {
		c.Email = &email.String
	}
	if address.Valid {
		c.Address = &address.String
	}
	return c, nil
}

func (a *app) fetchItem(id int64) (item, error) {
	var it item
	var description sql.NullString
	row := a.db.QueryRow(`SELECT id, name, type, price, description, created_at, updated_at FROM items WHERE id = ?`, id)
	if err := row.Scan(&it.ID, &it.Name, &it.Type, &it.Price, &description, &it.CreatedAt, &it.UpdatedAt); err != nil {
		return item{}, err
	}
	if description.Valid {
		it.Description = &description.String
	}
	return it, nil
}

func (a *app) fetchOrder(id int64) (order, error) {
	var o order
	var notes sql.NullString
	row := a.db.QueryRow(`SELECT id, customer_id, status, total_price, notes, created_at, updated_at FROM orders WHERE id = ?`, id)
	if err := row.Scan(&o.ID, &o.CustomerID, &o.Status, &o.TotalPrice, &notes, &o.CreatedAt, &o.UpdatedAt); err != nil {
		return order{}, err
	}
	if notes.Valid {
		o.Notes = &notes.String
	}
	return o, nil
}

func (a *app) fetchTransaction(id int64) (transaction, error) {
	var t transaction
	var orderID sql.NullInt64
	var paymentMethod sql.NullString
	var notes sql.NullString
	row := a.db.QueryRow(`SELECT id, order_id, amount, payment_method, status, notes, created_at, updated_at FROM transactions WHERE id = ?`, id)
	if err := row.Scan(&t.ID, &orderID, &t.Amount, &paymentMethod, &t.Status, &notes, &t.CreatedAt, &t.UpdatedAt); err != nil {
		return transaction{}, err
	}
	if orderID.Valid {
		value := orderID.Int64
		t.OrderID = &value
	}
	if paymentMethod.Valid {
		t.PaymentMethod = &paymentMethod.String
	}
	if notes.Valid {
		t.Notes = &notes.String
	}
	return t, nil
}

func handleFetchError(w http.ResponseWriter, err error, label string) {
	if err == sql.ErrNoRows {
		http.Error(w, fmt.Sprintf("%s not found", label), http.StatusNotFound)
		return
	}
	http.Error(w, err.Error(), http.StatusInternalServerError)
}
