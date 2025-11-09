import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Discounts() {
  const [discounts, setDiscounts] = useState([
    {
      id: 1,
      code: "SUMMER20",
      type: "Percentage",
      value: 20,
      minOrder: 50,
      maxUses: 100,
      usedCount: 45,
      status: "Active",
    },
    {
      id: 2,
      code: "NEWUSER",
      type: "Fixed",
      value: 10,
      minOrder: 0,
      maxUses: 500,
      usedCount: 234,
      status: "Active",
    },
    {
      id: 3,
      code: "EXPIRED10",
      type: "Percentage",
      value: 10,
      minOrder: 30,
      maxUses: 200,
      usedCount: 200,
      status: "Expired",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<any>(null);

  const handleSave = () => {
    toast({
      title: "Success",
      description: "Discount saved successfully",
    });
    setIsDialogOpen(false);
    setEditingDiscount(null);
  };

  const handleDelete = (id: number) => {
    setDiscounts(discounts.filter((d) => d.id !== id));
    toast({
      title: "Deleted",
      description: "Discount deleted successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Discounts</h1>
          <p className="text-muted-foreground">Manage discount codes and promotions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingDiscount(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Discount
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDiscount ? "Edit Discount" : "Create Discount"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Discount Code</Label>
                <Input id="code" placeholder="e.g., SUMMER20" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="value">Value</Label>
                  <Input id="value" type="number" placeholder="0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minOrder">Min. Order Value</Label>
                  <Input id="minOrder" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="maxUses">Max Uses</Label>
                  <Input id="maxUses" type="number" placeholder="Unlimited" />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSave} className="w-full">
                Save Discount
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Discounts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Min. Order</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell className="font-medium">{discount.code}</TableCell>
                  <TableCell>{discount.type}</TableCell>
                  <TableCell>
                    {discount.type === "Percentage"
                      ? `${discount.value}%`
                      : `$${discount.value}`}
                  </TableCell>
                  <TableCell>${discount.minOrder}</TableCell>
                  <TableCell>
                    {discount.usedCount} / {discount.maxUses}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        discount.status === "Active"
                          ? "default"
                          : discount.status === "Expired"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {discount.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingDiscount(discount);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(discount.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
