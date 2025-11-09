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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, X, FileUp } from "lucide-react";
import { useBlogs, useCreateBlog, useUpdateBlog, useDeleteBlog } from "@/hooks/use-blogs";
import { apiClient } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function Blogs() {
  const { data: blogs = [], isLoading, refetch } = useBlogs();
  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog();
  const deleteBlog = useDeleteBlog();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [blogTypeTab, setBlogTypeTab] = useState<'manual' | 'pdf'>('manual');
  const [isUploadingBlog, setIsUploadingBlog] = useState(false);
  
  const [manualFormData, setManualFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    is_published: false,
  });
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>("");
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [multiImages, setMultiImages] = useState<Array<{ file: File; altText: string }>>([]);
  const [pendingImagePreview, setPendingImagePreview] = useState<string>("");
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

  const [pdfFormData, setPdfFormData] = useState({
    title: "",
    is_published: false,
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfThumbnailPreview, setPdfThumbnailPreview] = useState<string>("");
  const [pdfThumbnailFile, setPdfThumbnailFile] = useState<File | null>(null);

  const handleResetForms = () => {
    setManualFormData({
      title: "",
      excerpt: "",
      content: "",
      is_published: false,
    });
    setFeaturedImagePreview("");
    setFeaturedImageFile(null);
    setMultiImages([]);
    setPendingImagePreview("");
    setPendingImageFile(null);

    setPdfFormData({
      title: "",
      is_published: false,
    });
    setPdfFile(null);
    setPdfThumbnailPreview("");
    setPdfThumbnailFile(null);
  };

  const handleSaveManualBlog = async () => {
    if (!manualFormData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Blog title is required",
        variant: "destructive",
      });
      return;
    }

    if (!manualFormData.excerpt.trim()) {
      toast({
        title: "Validation Error",
        description: "Blog excerpt is required",
        variant: "destructive",
      });
      return;
    }

    if (!manualFormData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Blog content is required",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingBlog(true);
    try {
      const blog = await createBlog.mutateAsync({
        ...manualFormData,
        blog_type: 'manual',
      });

      if (featuredImageFile) {
        try {
          await apiClient.uploadBlogFeaturedImage(blog.id, featuredImageFile);
        } catch (error) {
          console.error("Error uploading featured image:", error);
          toast({
            title: "Warning",
            description: "Blog saved but featured image upload failed",
            variant: "destructive",
          });
        }
      }

      if (multiImages.length > 0) {
        for (let i = 0; i < multiImages.length; i++) {
          const img = multiImages[i];
          try {
            await apiClient.uploadBlogImage(blog.id, img.file, img.altText, i);
            toast({
              title: "Success",
              description: `Image uploaded: ${img.file.name}`,
            });
          } catch (error) {
            console.error("Error uploading image:", error);
            toast({
              title: "Upload Error",
              description: `Failed to upload ${img.file.name}`,
              variant: "destructive",
            });
          }
        }
      }

      setIsDialogOpen(false);
      handleResetForms();
      await refetch();
      toast({
        title: "Success",
        description: "Manual blog created successfully",
      });
    } catch (error) {
      console.error("Error saving blog:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save blog",
        variant: "destructive",
      });
    } finally {
      setIsUploadingBlog(false);
    }
  };

  const handleSavePdfBlog = async () => {
    if (!pdfFormData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Blog title is required",
        variant: "destructive",
      });
      return;
    }

    if (!pdfFile) {
      toast({
        title: "Validation Error",
        description: "PDF file is required",
        variant: "destructive",
      });
      return;
    }

    if (!pdfThumbnailFile) {
      toast({
        title: "Validation Error",
        description: "PDF thumbnail image is required",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingBlog(true);
    try {
      const blog = await createBlog.mutateAsync({
        title: pdfFormData.title,
        blog_type: 'pdf',
        is_published: pdfFormData.is_published,
      });

      try {
        await apiClient.uploadBlogPDF(blog.id, pdfFile, pdfThumbnailFile);
      } catch (error) {
        console.error("Error uploading PDF:", error);
        throw error;
      }

      setIsDialogOpen(false);
      handleResetForms();
      await refetch();
      toast({
        title: "Success",
        description: "PDF blog created successfully",
      });
    } catch (error) {
      console.error("Error saving PDF blog:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save PDF blog",
        variant: "destructive",
      });
    } finally {
      setIsUploadingBlog(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this blog?")) {
      await deleteBlog.mutateAsync(id);
    }
  };

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFeaturedImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      setFeaturedImageFile(file);
    }
  };

  const handleAddMultiImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      setPendingImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmMultiImage = (altText: string) => {
    if (!pendingImageFile) return;
    
    setMultiImages([...multiImages, { file: pendingImageFile, altText }]);
    toast({
      title: "Success",
      description: `Image added to queue: ${pendingImageFile.name}`,
    });
    setPendingImagePreview("");
    setPendingImageFile(null);
    
    const fileInput = document.getElementById("multi-image-input") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleRemoveMultiImage = (index: number) => {
    setMultiImages(multiImages.filter((_, i) => i !== index));
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      toast({
        title: "Error",
        description: "Please select a valid PDF file",
        variant: "destructive",
      });
    }
  };

  const handlePdfThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPdfThumbnailPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      setPdfThumbnailFile(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Blogs</h1>
          <p className="text-muted-foreground">Manage manual blogs and PDF documents</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setBlogTypeTab('manual');
              handleResetForms();
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Blog
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Blog</DialogTitle>
            </DialogHeader>

            <div className="flex gap-2 mb-4 border-b">
              <button
                onClick={() => setBlogTypeTab('manual')}
                className={`px-4 py-2 font-medium ${blogTypeTab === 'manual' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
              >
                Manual Blog
              </button>
              <button
                onClick={() => setBlogTypeTab('pdf')}
                className={`px-4 py-2 font-medium ${blogTypeTab === 'pdf' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
              >
                PDF Blog
              </button>
            </div>

            {blogTypeTab === 'manual' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="manual-title">Blog Title</Label>
                  <Input
                    id="manual-title"
                    placeholder="Enter blog title"
                    value={manualFormData.title}
                    onChange={(e) =>
                      setManualFormData({ ...manualFormData, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="manual-excerpt">Excerpt (Summary)</Label>
                  <Textarea
                    id="manual-excerpt"
                    placeholder="Enter a brief excerpt or summary"
                    rows={3}
                    value={manualFormData.excerpt}
                    onChange={(e) =>
                      setManualFormData({ ...manualFormData, excerpt: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="manual-content">Full Content</Label>
                  <Textarea
                    id="manual-content"
                    placeholder="Enter the complete blog content"
                    rows={10}
                    value={manualFormData.content}
                    onChange={(e) =>
                      setManualFormData({ ...manualFormData, content: e.target.value })
                    }
                    className="font-mono text-sm"
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">Featured Image</h3>
                  {featuredImagePreview && (
                    <div className="mb-4 relative">
                      <img
                        src={featuredImagePreview}
                        alt="Featured"
                        className="max-h-48 rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setFeaturedImagePreview("");
                          setFeaturedImageFile(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      id="featured-image"
                      type="file"
                      accept="image/*"
                      onChange={handleFeaturedImageChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("featured-image")?.click()}
                    >
                      <FileUp className="mr-2 h-4 w-4" />
                      Upload Featured Image
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">Gallery Images (Multiple)</h3>
                  
                  {pendingImagePreview && (
                    <ImagePreviewForm
                      preview={pendingImagePreview}
                      onConfirm={handleConfirmMultiImage}
                      onCancel={() => setPendingImagePreview("")}
                    />
                  )}

                  {!pendingImagePreview && (
                    <div>
                      <Label htmlFor="multi-image-input">Add Image</Label>
                      <Input
                        id="multi-image-input"
                        type="file"
                        accept="image/*"
                        onChange={handleAddMultiImage}
                        className="mt-1"
                      />
                    </div>
                  )}

                  {multiImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">
                        Images to Upload ({multiImages.length})
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {multiImages.map((img, idx) => (
                          <div
                            key={idx}
                            className="border rounded p-2 relative bg-muted"
                          >
                            <img
                              src={URL.createObjectURL(img.file)}
                              alt={`Preview ${idx}`}
                              className="w-full h-24 object-cover rounded mb-1"
                            />
                            <p className="text-xs font-medium truncate">
                              {img.altText || img.file.name}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full mt-1 h-7"
                              onClick={() => handleRemoveMultiImage(idx)}
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

                <div className="border-t pt-4">
                  <Label htmlFor="manual-published">Status</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      id="manual-published"
                      type="checkbox"
                      checked={manualFormData.is_published}
                      onChange={(e) =>
                        setManualFormData({ ...manualFormData, is_published: e.target.checked })
                      }
                      className="rounded"
                    />
                    <Label htmlFor="manual-published" className="cursor-pointer">
                      Publish this blog
                    </Label>
                  </div>
                </div>

                <div className="border-t pt-4 flex gap-2">
                  <Button
                    onClick={handleSaveManualBlog}
                    disabled={isUploadingBlog}
                    className="flex-1"
                  >
                    {isUploadingBlog ? "Saving..." : "Create Manual Blog"}
                  </Button>
                  <Button
                    onClick={() => setIsDialogOpen(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {blogTypeTab === 'pdf' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pdf-title">Blog Title</Label>
                  <Input
                    id="pdf-title"
                    placeholder="Enter blog title"
                    value={pdfFormData.title}
                    onChange={(e) =>
                      setPdfFormData({ ...pdfFormData, title: e.target.value })
                    }
                  />
                </div>

                <div className="border rounded-lg p-4 bg-blue-50">
                  <h4 className="text-sm font-medium mb-3">PDF File</h4>
                  {pdfFile && (
                    <div className="mb-3 p-2 bg-white border rounded flex items-center justify-between">
                      <span className="text-sm">{pdfFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setPdfFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      id="pdf-file"
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("pdf-file")?.click()}
                    >
                      <FileUp className="mr-2 h-4 w-4" />
                      Upload PDF File
                    </Button>
                  </div>
                </div>

                {pdfFile && (
                  <div className="border rounded-lg p-4 bg-green-50">
                    <h4 className="text-sm font-medium mb-3">Thumbnail Image (Required)</h4>
                    {pdfThumbnailPreview && (
                      <div className="mb-3 relative">
                        <img
                          src={pdfThumbnailPreview}
                          alt="PDF Thumbnail"
                          className="max-h-32 rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setPdfThumbnailPreview("");
                            setPdfThumbnailFile(null);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        id="pdf-thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={handlePdfThumbnailChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("pdf-thumbnail")?.click()}
                      >
                        <FileUp className="mr-2 h-3 w-3" />
                        Upload Thumbnail
                      </Button>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <Label htmlFor="pdf-published">Status</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      id="pdf-published"
                      type="checkbox"
                      checked={pdfFormData.is_published}
                      onChange={(e) =>
                        setPdfFormData({ ...pdfFormData, is_published: e.target.checked })
                      }
                      className="rounded"
                    />
                    <Label htmlFor="pdf-published" className="cursor-pointer">
                      Publish this blog
                    </Label>
                  </div>
                </div>

                <div className="border-t pt-4 flex gap-2">
                  <Button
                    onClick={handleSavePdfBlog}
                    disabled={isUploadingBlog}
                    className="flex-1"
                  >
                    {isUploadingBlog ? "Saving..." : "Create PDF Blog"}
                  </Button>
                  <Button
                    onClick={() => setIsDialogOpen(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Blogs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading blogs...</p>
          ) : blogs.length === 0 ? (
            <p className="text-muted-foreground">No blogs found. Create your first blog!</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogs.map((blog: any) => (
                    <TableRow key={blog.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {blog.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant={blog.blog_type === 'manual' ? 'default' : 'secondary'}>
                          {blog.blog_type === 'manual' ? 'Manual' : 'PDF'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={blog.is_published ? 'default' : 'secondary'}>
                          {blog.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(blog.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(blog.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface ImagePreviewFormProps {
  preview: string;
  onConfirm: (altText: string) => void;
  onCancel: () => void;
}

function ImagePreviewForm({ preview, onConfirm, onCancel }: ImagePreviewFormProps) {
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
          <Label htmlFor="alt">Alt Text (Optional)</Label>
          <Input
            id="alt"
            placeholder="Describe this image"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => onConfirm(altText)}
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
