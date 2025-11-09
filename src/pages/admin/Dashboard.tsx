import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Tag } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function Dashboard() {
  const [productCount, setProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [products, categories, fetchedOrders] = await Promise.all([
          apiClient.getProducts(),
          apiClient.getCategories(),
          apiClient.getOrders(),
        ]);

        setProductCount(products.length);
        setCategoryCount(categories.length);
        setOrderCount(fetchedOrders.length);
        setOrders(fetchedOrders.slice(0, 4));
        setLowStockProducts(products.filter((p) => p.stock < 10).slice(0, 4));
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your store</p>
        </div>
        <p className="text-muted-foreground">No orders yet</p>
      </div>
    );
  }

  const stats = [
    { name: "Total Products", value: productCount.toString(), icon: Package },
    { name: "Total Orders", value: orderCount.toString(), icon: ShoppingCart },
    { name: "Categories", value: categoryCount.toString(), icon: Tag },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <p className="font-medium text-foreground">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.user.username}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">${order.total_amount}</p>
                      <p className="text-sm text-muted-foreground">{order.is_paid ? "Paid" : "Pending"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Products</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">All products well stocked</p>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-destructive">{product.stock} left</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
