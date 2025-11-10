import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { apiClient } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function Products() {
  const { data: products = [], isLoading, refetch } = useProducts();
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isUploadingProduct, setIsUploadingProduct] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    delivery_charges: "",
    sku: "",
    stock: "0",
    category: "",
    is_active: true,
    images: [] as Array<{ file: File; color: string; altText: string }>,
  });
  const [pendingImagePreview, setPendingImagePreview] = useState<string>("");
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

  const handleOpenDialog = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        delivery_charges: product.delivery_charges || "",
        sku: product.sku,
        stock: product.stock.toString(),
        category: product.category?.id ? product.category.id.toString() : (product.category_id?.toString() || ""),
        is_active: product.is_active,
        images: [],
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        delivery_charges: "",
        sku: "",
        stock: "0",
        category: "",
        is_active: true,
        images: [],
      });
    }
    setPendingImagePreview("");
    setPendingImageFile(null);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const { images, ...productData } = formData;

    if (!productData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return;
    }

    if (!productData.category || productData.category === "") {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    if (!productData.price || productData.price === "") {
      toast({
        title: "Validation Error",
        description: "Price is required",
        variant: "destructive",
      });
      return;
    }

    if (!productData.sku.trim()) {
      toast({
        title: "Validation Error",
        description: "SKU is required",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingProduct(true);
    try {
      const price = parseFloat(productData.price);
      const stock = parseInt(productData.stock) || 0;
      const category = parseInt(productData.category);

      if (isNaN(price) || price < 0) {
        toast({
          title: "Validation Error",
          description: "Price must be a valid positive number",
          variant: "destructive",
        });
        setIsUploadingProduct(false);
        return;
      }

      if (isNaN(stock) || stock < 0) {
        toast({
          title: "Validation Error",
          description: "Stock must be a valid non-negative number",
          variant: "destructive",
        });
        setIsUploadingProduct(false);
        return;
      }

      if (isNaN(category) || category <= 0) {
        toast({
          title: "Validation Error",
          description: "Please select a valid category",
          variant: "destructive",
        });
        setIsUploadingProduct(false);
        return;
      }

      // backend expects a category_id field for the relation - send that instead
      // construct payload explicitly and include both category and category_id to satisfy
      // backend expectations. Cast to any when sending to the API to avoid strict TS mismatch.
<<<<<<< HEAD
      const deliveryCharges = productData.delivery_charges ? parseFloat(productData.delivery_charges) : 0;

=======
>>>>>>> a63b1098797073ef46d42b081b18cf66e94c8717
      const payload: any = {
        name: productData.name,
        description: productData.description,
        sku: productData.sku,
        is_active: productData.is_active,
        price: price.toFixed(2),
<<<<<<< HEAD
        delivery_charges: deliveryCharges.toFixed(2),
=======
>>>>>>> a63b1098797073ef46d42b081b18cf66e94c8717
        stock,
        category: category,
        category_id: category,
      };

      let product;
      if (editingProduct) {
        product = await updateProduct.mutateAsync({
          id: editingProduct.id,
          data: payload,
        });
      } else {
        product = await createProduct.mutateAsync(payload);
      }

      if (images.length > 0) {
        console.log("Starting image uploads for product", product.id, "with", images.length, "images");
        let uploadedImages = [];
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          try {
            console.log("Uploading image", i, "for product", product.id, "file:", img.file.name, "color:", img.color);
            const uploadedImg = await apiClient.uploadProductImage(
              product.id,
              img.file,
              img.color,
              img.altText,
              i === 0
            );
            console.log("Uploaded image response:", uploadedImg);
            uploadedImages.push(uploadedImg);
            
            toast({
              title: "Success",
              description: `Image uploaded: ${img.file.name}`,
            });
          } catch (error) {
            console.error("Error uploading image:", error);
            toast({
              title: "Upload Error",
              description: `Failed to upload ${img.file.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
              variant: "destructive",
            });
          }
        }
        
        if (uploadedImages.length > 0) {
          const imageUrl = uploadedImages[0].image;
          console.log("Setting product image to:", imageUrl);
          if (imageUrl) {
            try {
              const filePath = imageUrl.includes('/media/') 
                ? imageUrl.split('/media/')[1] 
                : imageUrl;
              console.log("Extracted file path:", filePath);
              await updateProduct.mutateAsync({
                id: product.id,
                data: { image: filePath },
              });
              console.log("Product image updated successfully");
            } catch (updateError) {
              console.error("Error updating product image:", updateError);
            }
          }
        }
      }

      setIsDialogOpen(false);
      setEditingProduct(null);
      await refetch();
    } catch (error) {
      console.error("Error saving product:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save product";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploadingProduct(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteProduct.mutateAsync(id);
    }
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("File selected:", file?.name, file?.size, file?.type);
    
    if (!file) {
      console.log("No file selected");
      return;
    }
    
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }
    
    setPendingImageFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      console.log("Image preview loaded, size:", result.length);
      setPendingImagePreview(result);
    };
    reader.onerror = () => {
      console.error("FileReader error");
      toast({
        title: "Error",
        description: "Failed to read image file",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmImage = (color: string, altText: string) => {
    if (!pendingImageFile) {
      console.error("No pending image file");
      toast({
        title: "Error",
        description: "No image file selected",
        variant: "destructive",
      });
      return;
    }
    
    const newImage = { file: pendingImageFile, color, altText };
    const updatedImages = [...formData.images, newImage];
    
    console.log("File confirmed:", pendingImageFile.name, "Color:", color);
    console.log("Updated images queue:", updatedImages.length, "images");
    
    setFormData({
      ...formData,
      images: updatedImages,
    });
    toast({
      title: "Success",
      description: `Image added to queue: ${pendingImageFile.name}`,
    });
    setPendingImagePreview("");
    setPendingImageFile(null);
    
    const fileInput = document.getElementById("image-input") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add Product"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter product description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price (AED)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="delivery_charges">Delivery Charges (AED)</Label>
                  <Input
                    id="delivery_charges"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={formData.delivery_charges}
                    onChange={(e) =>
                      setFormData({ ...formData, delivery_charges: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  placeholder="e.g., PROD-001"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="active">Status</Label>
                <Select
                  value={formData.is_active ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, is_active: value === "active" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">Product Images</h3>
                
                {pendingImagePreview && (
                  <ImagePreviewForm
                    preview={pendingImagePreview}
                    onConfirm={handleConfirmImage}
                    onCancel={() => setPendingImagePreview("")}
                  />
                )}

                {!pendingImagePreview && (
                  <div>
                    <Label htmlFor="image-input">Add Image</Label>
                    <Input
                      id="image-input"
                      type="file"
                      accept="image/*"
                      onChange={handleAddImage}
                      className="mt-1"
                    />
                  </div>
                )}

                {formData.images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">
                      Images to Upload ({formData.images.length})
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {formData.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="border rounded p-2 relative bg-muted"
                        >
                          <img
                            src={URL.createObjectURL(img.file)}
                            alt={`Preview ${idx}`}
                            className="w-full h-24 object-cover rounded mb-1"
                          />
                          <p className="text-xs font-medium">Color: {img.color}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-1 h-7"
                            onClick={() => handleRemoveImage(idx)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleSave}
                className="w-full"
                disabled={isUploadingProduct || createProduct.isPending || updateProduct.isPending}
              >
                {isUploadingProduct
                  ? "Uploading..."
                  : createProduct.isPending || updateProduct.isPending
                  ? "Saving..."
                  : "Save Product"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6">Loading products...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category?.name || "-"}</TableCell>
                    <TableCell>AED {parseFloat(product.price).toFixed(2)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                        disabled={deleteProduct.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface ImagePreviewFormProps {
  preview: string;
  onConfirm: (color: string, altText: string) => void;
  onCancel: () => void;
}

function ImagePreviewForm({ preview, onConfirm, onCancel }: ImagePreviewFormProps) {
  const [color, setColor] = useState("Default");
  const [altText, setAltText] = useState("");

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm">Confirm Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <img
          src={preview}
          alt="Preview"
          className="w-full h-40 object-cover rounded"
        />
        <div>
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            placeholder="e.g., Red, Blue, Black"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="alt">Alt Text (Optional)</Label>
          <Input
            id="alt"
            placeholder="Describe this variant"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => onConfirm(color, altText)}
            className="flex-1"
            size="sm"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Image
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
