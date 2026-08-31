import { pool } from "../db/pool.js";

// GET /api/admin/dashboard/stats — DashboardPage
export async function getStats(_req, res) {
  const [revenue, ordersByStatus, lowStock, recentOrders, topProducts] = await Promise.all([
    pool.query(
      `SELECT COALESCE(SUM(total), 0) AS total_revenue, COUNT(*) AS order_count
       FROM orders WHERE status <> 'cancelled'`,
    ),
    pool.query(`SELECT status, COUNT(*) AS count FROM orders GROUP BY status`),
    pool.query(
      `SELECT id, title, stock FROM products WHERE stock <= 5 ORDER BY stock ASC LIMIT 10`,
    ),
    pool.query(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 8`),
    pool.query(
      `SELECT p.id, p.title, p.image, COALESCE(SUM(oi.qty), 0) AS units_sold
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       GROUP BY p.id
       ORDER BY units_sold DESC
       LIMIT 5`,
    ),
  ]);

  res.json({
    totalRevenue: Number(revenue.rows[0].total_revenue),
    orderCount: Number(revenue.rows[0].order_count),
    ordersByStatus: Object.fromEntries(
      ordersByStatus.rows.map((r) => [r.status, Number(r.count)]),
    ),
    lowStock: lowStock.rows,
    recentOrders: recentOrders.rows.map((o) => ({
      id: o.id,
      customerName: o.customer_name,
      status: o.status,
      total: Number(o.total),
      createdAt: o.created_at,
    })),
    topProducts: topProducts.rows.map((p) => ({
      id: p.id,
      title: p.title,
      image: p.image,
      unitsSold: Number(p.units_sold),
    })),
  });
}
