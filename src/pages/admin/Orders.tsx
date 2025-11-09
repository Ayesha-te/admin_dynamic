import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Package } from "lucide-react";
import { useOrders, useOrder, useMarkOrderAsPaid, useMarkOrderAsShipped } from "@/hooks/use-orders";

export default function Orders() {
  const { data: orders = [], isLoading } = useOrders();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const { data: selectedOrder } = useOrder(selectedOrderId ?? 0);
  const markPaid = useMarkOrderAsPaid();
  const markShipped = useMarkOrderAsShipped();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "secondary";
      case "processing":
        return "secondary";
      case "shipped":
        return "default";
      case "delivered":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and deliveries</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6">Loading orders...</TableCell>
                </TableRow>
              ) : (
                orders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <p className="font-medium">{order.user?.username || order.user?.email}</p>
                    </TableCell>
                    <TableCell className="text-sm">{order.user?.email}</TableCell>
                    <TableCell>{order.phone || "-"}</TableCell>
                    <TableCell className="text-sm max-w-xs truncate">{order.address || "-"}</TableCell>
                    <TableCell className="font-medium">AED {Number(order.total_amount).toFixed(2)}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(order.status as string) as any}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedOrderId(order.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Order Details - #{order.id}</DialogTitle>
                          </DialogHeader>
                          {selectedOrder && selectedOrder.id === order.id && (
                            <div className="space-y-6 pb-6">
                              <div className="grid grid-cols-2 gap-4">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-sm">Customer Information</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2 text-sm">
                                    <div>
                                      <p className="font-medium text-foreground">{selectedOrder.user?.username || selectedOrder.user?.email}</p>
                                      <p className="text-muted-foreground">{selectedOrder.user?.email}</p>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-sm">Delivery Details</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2 text-sm">
                                    <div>
                                      <p className="font-medium text-foreground">Phone:</p>
                                      <p className="text-muted-foreground">{selectedOrder.phone || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="font-medium text-foreground">Address:</p>
                                      <p className="text-muted-foreground">{selectedOrder.address || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="font-medium text-foreground">City:</p>
                                      <p className="text-muted-foreground">{selectedOrder.city || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="font-medium text-foreground">Postal Code:</p>
                                      <p className="text-muted-foreground">{selectedOrder.postal_code || '-'}</p>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-sm">Order Items</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Color</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Total</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {selectedOrder.items.map((item: any, idx: number) => (
                                        <TableRow key={idx}>
                                          <TableCell>{item.product?.name}</TableCell>
                                          <TableCell>{item.color || 'Default'}</TableCell>
                                          <TableCell>{item.quantity}</TableCell>
                                          <TableCell>AED {Number(item.price).toFixed(2)}</TableCell>
                                          <TableCell>
                                            AED {(Number(item.quantity) * Number(item.price)).toFixed(2)}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                      <TableRow>
                                        <TableCell colSpan={4} className="font-bold text-right">
                                          Total:
                                        </TableCell>
                                        <TableCell className="font-bold">
                                          AED {Number(selectedOrder.total_amount).toFixed(2)}
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </CardContent>
                              </Card>

                              <div className="flex gap-2 pt-4 border-t">
                                <Button 
                                  className="flex-1" 
                                  onClick={() => markShipped.mutate(selectedOrder.id)}
                                  disabled={markShipped.isPending || selectedOrder.status === 'shipped'}
                                >
                                  <Package className="mr-2 h-4 w-4" />
                                  {markShipped.isPending ? 'Updating...' : 'Mark as Shipped'}
                                </Button>
                                <Button 
                                  variant="default" 
                                  className="flex-1" 
                                  onClick={() => markPaid.mutate(selectedOrder.id)}
                                  disabled={markPaid.isPending || selectedOrder.is_paid}
                                >
                                  {markPaid.isPending ? 'Updating...' : 'Mark as Paid'}
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
