import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [orders, setOrders] = useState([]);

  const [products, setProducts] = useState([]);

  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [grams, setGrams] = useState("");
  const [amount, setAmount] = useState("");
const [search, setSearch] = useState("");

useEffect(() => {
  fetchOrders();
  fetchProducts();
}, []);

const fetchOrders = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const formattedOrders = data.map((order) => ({
    id: order.id,
    customer: order.customer,
    product: order.product,
    grams: order.grams,
    amount: order.amount,
    status: order.status,
    createdAt: new Date(
      order.created_at
    ).toLocaleString(),
  }));

  setOrders(formattedOrders);
};

const fetchProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name");

  if (error) {
    console.error(error);
    return;
  }

  setProducts(data);
};

// useEffect(() => {
//   localStorage.setItem(
//     "orders",
//     JSON.stringify(orders)
//   );
// }, [orders]);
  
  const voidOrder = (id) => {
    setOrders(
      orders.map((order) =>
        order.id === id
          ? { ...order, status: "Voided" }
          : order
      )
    );
  };

  const revenue = orders.reduce((sum, order) => sum + order.amount, 0);

  const totalGrams = orders.reduce(
    (sum, order) => sum + order.grams,
    0
  );

  const productTotals = {};

  orders.forEach((order) => {
    productTotals[order.product] =
      (productTotals[order.product] || 0) + order.grams;
  });

  const bestSeller =
    Object.keys(productTotals).length > 0
      ? Object.keys(productTotals).reduce((a, b) =>
          productTotals[a] > productTotals[b] ? a : b
        )
      : "None";

  const customerTotals = {};

  orders.forEach((order) => {
    customerTotals[order.customer] =
      (customerTotals[order.customer] || 0) + order.amount;
  });

  const topCustomer =
    Object.keys(customerTotals).length > 0
      ? Object.keys(customerTotals).reduce((a, b) =>
          customerTotals[a] > customerTotals[b] ? a : b
        )
      : "None";

      const filteredOrders = orders.filter(
        (order) =>
          order.customer
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          order.product
            .toLowerCase()
            .includes(search.toLowerCase())
      );
      
      const dailySales = {};

orders.forEach((order) => {
  const date = order.createdAt.split(",")[0];

  if (!dailySales[date]) {
    dailySales[date] = 0;
  }

  dailySales[date] += order.amount;
});

const chartData = Object.entries(dailySales).map(
  ([date, revenue]) => ({
    date,
    revenue,
  })
);

  const productStats = {};

  orders.forEach((order) => {
    if (!productStats[order.product]) {
      productStats[order.product] = {
        grams: 0,
        revenue: 0,
      };
    }

    productStats[order.product].grams += order.grams;
    productStats[order.product].revenue += order.amount;
  });

  const inventoryStatus = products.map((item) => ({
  product: item.name,
  remaining: item.stock,
  sold: productStats[item.name]?.grams || 0,
}));

  const addOrder = async () => {
  if (!customer || !product || !grams || !amount) {
    alert("Please fill all fields");
    return;
  }

  const selectedProduct = products.find(
  (item) => item.name === product
);

if (!selectedProduct) {
  alert("Product not found");
  return;
}

if (selectedProduct.stock < Number(grams)) {
  alert("Not enough stock available");
  return;
}

const { error } = await supabase
  .from("orders")
  .insert([
    {
      customer:
        customer.trim().charAt(0).toUpperCase() +
        customer.trim().slice(1).toLowerCase(),

      product,
      grams: Number(grams),
      amount: Number(amount),
      status: "Active",
    },
  ]);

if (error) {
  console.error(error);
  alert("Failed to save order");
  return;
}

await supabase
  .from("products")
  .update({
    stock:
      selectedProduct.stock -
      Number(grams),
  })
  .eq("id", selectedProduct.id);

  await fetchProducts();

  if (error) {
    console.error(error);
    alert("Failed to save order");
    return;
  }

  await fetchOrders();

  setCustomer("");
  setProduct("");
  setGrams("");
  setAmount("");
};

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Uche Sales Dashboard</h1>

      <h2>Add Order</h2>

      <input
        placeholder="Customer Name"
        value={customer}
        onChange={(e) => setCustomer(e.target.value)}
      />

      <br />
      <br />

      <select
  value={product}
  onChange={(e) => setProduct(e.target.value)}
>
  <option value="">Select Product</option>

  {products.map((item) => (
    <option
      key={item.id}
      value={item.name}
    >
      {item.name}
    </option>
  ))}
</select>

      <br />
      <br />

      <input
        placeholder="Grams"
        type="number"
        value={grams}
        onChange={(e) => setGrams(e.target.value)}
      />

      <br />
      <br />

      <input
        placeholder="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <br />
      <br />

      <button onClick={addOrder}>Add Order</button>

      <hr />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Revenue Today</h3>
          <h2>₦{revenue.toLocaleString()}</h2>
        </div>

        <div
          style={{
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Orders Today</h3>
          <h2>{orders.length}</h2>
        </div>

        <div
          style={{
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Best Seller</h3>
          <h2>{bestSeller}</h2>
        </div>

        <div
          style={{
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Top Customer</h3>
          <h2>{topCustomer}</h2>
        </div>

        <div
          style={{
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Total Grams Sold</h3>
          <h2>{totalGrams.toLocaleString()}g</h2>
        </div>
      </div>

      <h2>Revenue Trend</h2>

<div
  style={{
    width: "100%",
    height: 300,
    marginBottom: "30px",
  }}
>
  <ResponsiveContainer>
    <LineChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />

      <XAxis dataKey="date" />

      <YAxis />

      <Tooltip />

      <Line
        type="monotone"
        dataKey="revenue"
      />
    </LineChart>
  </ResponsiveContainer>
</div>

      <h2>Daily Sales Report</h2>

<table
  style={{
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
  }}
>
  <thead>
    <tr>
      <th style={{ border: "1px solid #ddd", padding: "10px" }}>
        Date
      </th>

      <th style={{ border: "1px solid #ddd", padding: "10px" }}>
        Revenue
      </th>
    </tr>
  </thead>

  <tbody>
    {Object.entries(dailySales).map(([date, revenue]) => (
      <tr key={date}>
        <td style={{ border: "1px solid #ddd", padding: "10px" }}>
          {date}
        </td>

        <td style={{ border: "1px solid #ddd", padding: "10px" }}>
          ₦{revenue.toLocaleString()}
        </td>
      </tr>
    ))}
  </tbody>
</table>

<h2>Inventory Status</h2>

<table
  style={{
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
  }}
>
  <thead>
    <tr>
      <th style={{ border: "1px solid #ddd", padding: "10px" }}>
        Product
      </th>

      <th style={{ border: "1px solid #ddd", padding: "10px" }}>
        Sold
      </th>

      <th style={{ border: "1px solid #ddd", padding: "10px" }}>
        Remaining
      </th>
    </tr>
  </thead>

  <tbody>
    {inventoryStatus.map((item) => (
      <tr key={item.product}>
        <td
          style={{
            border: "1px solid #ddd",
            padding: "10px",
          }}
        >
          {item.product}
        </td>

        <td
          style={{
            border: "1px solid #ddd",
            padding: "10px",
          }}
        >
          {item.sold.toLocaleString()}g
        </td>

        <td
          style={{
            border: "1px solid #ddd",
            padding: "10px",
          }}
        >
          {item.remaining.toLocaleString()}g
        </td>
      </tr>
    ))}
  </tbody>
</table>

      <h2>Product Performance</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "20px",
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>
              Product
            </th>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>
              Grams Sold
            </th>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>
              Revenue
            </th>
          </tr>
        </thead>

        <tbody>
          {Object.entries(productStats).map(([product, stats]) => (
            <tr key={product}>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {product}
              </td>

              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {stats.grams.toLocaleString()}g
              </td>

              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                ₦{stats.revenue.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Search Orders</h2>

<input
  type="text"
  placeholder="Search customer or product..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  style={{
    padding: "10px",
    width: "300px",
    marginBottom: "20px",
  }}
/>

<h2>Products From Database</h2>

<ul>
  {products.map((product) => (
    <li key={product.id}>
      {product.name} - {product.stock.toLocaleString()}g
    </li>
  ))}
</ul>

<h2>Recent Orders</h2>

      <div>
      {filteredOrders.map((order) => (
          <div
            key={order.id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "10px",
            }}
          >
            <p>
              <strong>Order ID:</strong> #{order.id}
            </p>

            <p>
              <strong>Customer:</strong> {order.customer}
            </p>

            <p>
              <strong>Product:</strong> {order.product}
            </p>

            <p>
              <strong>Grams:</strong> {order.grams}g
            </p>

            <p>
              <strong>Amount:</strong> ₦{order.amount.toLocaleString()}
            </p>

            <p>
              <strong>Status:</strong> {order.status}
            </p>

            <p>
  <strong>Created:</strong> {order.createdAt}
</p>

<button
  onClick={() => voidOrder(order.id)}
  disabled={order.status === "Voided"}
>
  {order.status === "Voided"
    ? "Already Voided"
    : "Void Order"}
</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;