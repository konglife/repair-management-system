"use client";

import { Package, FolderOpen, Plus, Edit, Trash2, Loader2, Ruler, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { api } from "~/app/providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function StockPage() {
  const [activeTab, setActiveTab] = useState<"categories" | "units" | "products" | "purchases">("categories");
  
  // Categories state
  const [showCreateCategoryForm, setShowCreateCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editCategoryName, setEditCategoryName] = useState("");

  // Units state
  const [showCreateUnitForm, setShowCreateUnitForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<{ id: string; name: string } | null>(null);
  const [deleteUnitConfirm, setDeleteUnitConfirm] = useState<string | null>(null);
  const [newUnitName, setNewUnitName] = useState("");
  const [editUnitName, setEditUnitName] = useState("");

  // Products state
  const [showCreateProductForm, setShowCreateProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<{ id: string; name: string; salePrice: number; categoryId: string; unitId: string } | null>(null);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductCategoryId, setNewProductCategoryId] = useState("");
  const [newProductUnitId, setNewProductUnitId] = useState("");
  const [editProductName, setEditProductName] = useState("");
  const [editProductPrice, setEditProductPrice] = useState("");
  const [editProductCategoryId, setEditProductCategoryId] = useState("");
  const [editProductUnitId, setEditProductUnitId] = useState("");

  // Purchase recording state
  const [selectedProductForPurchase, setSelectedProductForPurchase] = useState("");
  const [purchaseQuantity, setPurchaseQuantity] = useState("");
  const [purchaseCostPerUnit, setPurchaseCostPerUnit] = useState("");
  const [selectedProductForHistory, setSelectedProductForHistory] = useState("");

  // tRPC queries and mutations for categories
  const { data: categories = [], refetch: refetchCategories, isLoading: categoriesLoading } = api.categories.getAll.useQuery();
  
  const createCategoryMutation = api.categories.create.useMutation({
    onSuccess: () => {
      refetchCategories();
      setShowCreateCategoryForm(false);
      setNewCategoryName("");
    },
    onError: (error) => {
      alert(`Failed to create category: ${error.message}`);
    },
  });

  const updateCategoryMutation = api.categories.update.useMutation({
    onSuccess: () => {
      refetchCategories();
      setEditingCategory(null);
      setEditCategoryName("");
    },
    onError: (error) => {
      alert(`Failed to update category: ${error.message}`);
    },
  });

  const deleteCategoryMutation = api.categories.delete.useMutation({
    onSuccess: () => {
      refetchCategories();
      setDeleteCategoryConfirm(null);
    },
    onError: (error) => {
      alert(`Failed to delete category: ${error.message}`);
      setDeleteCategoryConfirm(null);
    },
  });

  // tRPC queries and mutations for units
  const { data: units = [], refetch: refetchUnits, isLoading: unitsLoading } = api.units.getAll.useQuery();

  // tRPC queries and mutations for products
  const { data: products = [], refetch: refetchProducts, isLoading: productsLoading } = api.products.getAll.useQuery();

  // tRPC queries and mutations for purchases
  const { data: allPurchases = [], refetch: refetchAllPurchases, isLoading: allPurchasesLoading } = api.purchases.getAll.useQuery();
  
  const { data: productPurchases = [], refetch: refetchProductPurchases, isLoading: productPurchasesLoading } = api.purchases.getByProduct.useQuery(
    { productId: selectedProductForHistory },
    { enabled: !!selectedProductForHistory }
  );

  // Determine which purchase data to show
  const purchaseHistory = selectedProductForHistory ? productPurchases : allPurchases;
  const purchaseHistoryLoading = selectedProductForHistory ? productPurchasesLoading : allPurchasesLoading;

  const createPurchaseMutation = api.purchases.create.useMutation({
    onSuccess: () => {
      refetchProducts();
      refetchAllPurchases();
      if (selectedProductForHistory) {
        refetchProductPurchases();
      }
      setSelectedProductForPurchase("");
      setPurchaseQuantity("");
      setPurchaseCostPerUnit("");
      alert("Purchase recorded successfully!");
    },
    onError: (error) => {
      alert(`Failed to record purchase: ${error.message}`);
    },
  });
  
  const createUnitMutation = api.units.create.useMutation({
    onSuccess: () => {
      refetchUnits();
      setShowCreateUnitForm(false);
      setNewUnitName("");
    },
    onError: (error) => {
      alert(`Failed to create unit: ${error.message}`);
    },
  });

  const updateUnitMutation = api.units.update.useMutation({
    onSuccess: () => {
      refetchUnits();
      setEditingUnit(null);
      setEditUnitName("");
    },
    onError: (error) => {
      alert(`Failed to update unit: ${error.message}`);
    },
  });

  const deleteUnitMutation = api.units.delete.useMutation({
    onSuccess: () => {
      refetchUnits();
      setDeleteUnitConfirm(null);
    },
    onError: (error) => {
      alert(`Failed to delete unit: ${error.message}`);
      setDeleteUnitConfirm(null);
    },
  });

  const createProductMutation = api.products.create.useMutation({
    onSuccess: () => {
      refetchProducts();
      setShowCreateProductForm(false);
      setNewProductName("");
      setNewProductPrice("");
      setNewProductCategoryId("");
      setNewProductUnitId("");
    },
    onError: (error) => {
      alert(`Failed to create product: ${error.message}`);
    },
  });

  const updateProductMutation = api.products.update.useMutation({
    onSuccess: () => {
      refetchProducts();
      setEditingProduct(null);
      setEditProductName("");
      setEditProductPrice("");
      setEditProductCategoryId("");
      setEditProductUnitId("");
    },
    onError: (error) => {
      alert(`Failed to update product: ${error.message}`);
    },
  });

  // Category handlers
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    createCategoryMutation.mutate({ name: newCategoryName.trim() });
  };

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editCategoryName.trim()) return;
    updateCategoryMutation.mutate({ 
      id: editingCategory.id, 
      name: editCategoryName.trim() 
    });
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategoryMutation.mutate({ id });
  };

  const startEditCategory = (category: { id: string; name: string }) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
  };

  const cancelEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryName("");
  };

  // Unit handlers
  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;
    createUnitMutation.mutate({ name: newUnitName.trim() });
  };

  const handleUpdateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit || !editUnitName.trim()) return;
    updateUnitMutation.mutate({ 
      id: editingUnit.id, 
      name: editUnitName.trim() 
    });
  };

  const handleDeleteUnit = (id: string) => {
    deleteUnitMutation.mutate({ id });
  };

  const startEditUnit = (unit: { id: string; name: string }) => {
    setEditingUnit(unit);
    setEditUnitName(unit.name);
  };

  const cancelEditUnit = () => {
    setEditingUnit(null);
    setEditUnitName("");
  };

  // Product handlers
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim() || !newProductPrice.trim() || !newProductCategoryId || !newProductUnitId) return;
    const salePrice = parseFloat(newProductPrice);
    if (isNaN(salePrice) || salePrice < 0) {
      alert("Please enter a valid sale price");
      return;
    }
    createProductMutation.mutate({ 
      name: newProductName.trim(),
      salePrice,
      categoryId: newProductCategoryId,
      unitId: newProductUnitId
    });
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editProductName.trim() || !editProductPrice.trim() || !editProductCategoryId || !editProductUnitId) return;
    const salePrice = parseFloat(editProductPrice);
    if (isNaN(salePrice) || salePrice < 0) {
      alert("Please enter a valid sale price");
      return;
    }
    updateProductMutation.mutate({ 
      id: editingProduct.id,
      name: editProductName.trim(),
      salePrice,
      categoryId: editProductCategoryId,
      unitId: editProductUnitId
    });
  };

  const startEditProduct = (product: { id: string; name: string; salePrice: number; categoryId: string; unitId: string }) => {
    setEditingProduct(product);
    setEditProductName(product.name);
    setEditProductPrice(product.salePrice.toString());
    setEditProductCategoryId(product.categoryId);
    setEditProductUnitId(product.unitId);
  };

  const cancelEditProduct = () => {
    setEditingProduct(null);
    setEditProductName("");
    setEditProductPrice("");
    setEditProductCategoryId("");
    setEditProductUnitId("");
  };

  // Purchase handlers
  const handleRecordPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForPurchase || !purchaseQuantity.trim() || !purchaseCostPerUnit.trim()) return;
    
    const quantity = parseInt(purchaseQuantity);
    const costPerUnit = parseFloat(purchaseCostPerUnit);
    
    if (isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }
    
    if (isNaN(costPerUnit) || costPerUnit < 0) {
      alert("Please enter a valid cost per unit");
      return;
    }
    
    createPurchaseMutation.mutate({
      productId: selectedProductForPurchase,
      quantity,
      costPerUnit
    });
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Stock Management</h2>
          <p className="text-muted-foreground">Manage your inventory, categories, and stock levels</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Product categories
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Ruler className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{units.length}</div>
            <p className="text-xs text-muted-foreground">
              Measurement units
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              Items in inventory
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-xs text-muted-foreground">
              Inventory value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "categories" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("categories")}
        >
          <FolderOpen className="h-4 w-4 mr-2" />
          Categories
        </Button>
        <Button
          variant={activeTab === "units" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("units")}
        >
          <Ruler className="h-4 w-4 mr-2" />
          Units
        </Button>
        <Button
          variant={activeTab === "products" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("products")}
        >
          <Package className="h-4 w-4 mr-2" />
          Products
        </Button>
        <Button
          variant={activeTab === "purchases" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("purchases")}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Record Purchase
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          {activeTab === "categories" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Categories</CardTitle>
                  <Button onClick={() => setShowCreateCategoryForm(!showCreateCategoryForm)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Create Category Form */}
                {showCreateCategoryForm && (
                  <div className="mb-4 p-4 border rounded-lg bg-muted/50">
                    <form onSubmit={handleCreateCategory} className="flex gap-2">
                      <Input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Category name"
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        type="submit"
                        disabled={createCategoryMutation.isPending || !newCategoryName.trim()}
                      >
                        {createCategoryMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Create"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowCreateCategoryForm(false);
                          setNewCategoryName("");
                        }}
                      >
                        Cancel
                      </Button>
                    </form>
                  </div>
                )}

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoriesLoading ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          </TableCell>
                        </TableRow>
                      ) : categories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            No categories found. Create your first category to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        categories.map((category: { id: string; name: string }) => (
                          <TableRow key={category.id}>
                            <TableCell>
                              {editingCategory?.id === category.id ? (
                                <form onSubmit={handleUpdateCategory} className="flex gap-2">
                                  <Input
                                    type="text"
                                    value={editCategoryName}
                                    onChange={(e) => setEditCategoryName(e.target.value)}
                                    className="flex-1 h-8"
                                    autoFocus
                                  />
                                  <Button
                                    type="submit"
                                    size="sm"
                                    disabled={updateCategoryMutation.isPending || !editCategoryName.trim()}
                                  >
                                    {updateCategoryMutation.isPending ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      "Save"
                                    )}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={cancelEditCategory}
                                  >
                                    Cancel
                                  </Button>
                                </form>
                              ) : (
                                <span className="font-medium">{category.name}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">0</TableCell>
                            <TableCell>
                              {editingCategory?.id === category.id ? null : (
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => startEditCategory(category)}
                                    className="h-8 w-8"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteCategoryConfirm(category.id)}
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === "units" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Units</CardTitle>
                  <Button onClick={() => setShowCreateUnitForm(!showCreateUnitForm)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Unit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Create Unit Form */}
                {showCreateUnitForm && (
                  <div className="mb-4 p-4 border rounded-lg bg-muted/50">
                    <form onSubmit={handleCreateUnit} className="flex gap-2">
                      <Input
                        type="text"
                        value={newUnitName}
                        onChange={(e) => setNewUnitName(e.target.value)}
                        placeholder="Unit name (e.g., piece, box, meter)"
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        type="submit"
                        disabled={createUnitMutation.isPending || !newUnitName.trim()}
                      >
                        {createUnitMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Create"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowCreateUnitForm(false);
                          setNewUnitName("");
                        }}
                      >
                        Cancel
                      </Button>
                    </form>
                  </div>
                )}

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unitsLoading ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          </TableCell>
                        </TableRow>
                      ) : units.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            No units found. Create your first unit to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        units.map((unit: { id: string; name: string }) => (
                          <TableRow key={unit.id}>
                            <TableCell>
                              {editingUnit?.id === unit.id ? (
                                <form onSubmit={handleUpdateUnit} className="flex gap-2">
                                  <Input
                                    type="text"
                                    value={editUnitName}
                                    onChange={(e) => setEditUnitName(e.target.value)}
                                    className="flex-1 h-8"
                                    autoFocus
                                  />
                                  <Button
                                    type="submit"
                                    size="sm"
                                    disabled={updateUnitMutation.isPending || !editUnitName.trim()}
                                  >
                                    {updateUnitMutation.isPending ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      "Save"
                                    )}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={cancelEditUnit}
                                  >
                                    Cancel
                                  </Button>
                                </form>
                              ) : (
                                <span className="font-medium">{unit.name}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">0</TableCell>
                            <TableCell>
                              {editingUnit?.id === unit.id ? null : (
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => startEditUnit(unit)}
                                    className="h-8 w-8"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteUnitConfirm(unit.id)}
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === "products" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Products</CardTitle>
                  <Button onClick={() => setShowCreateProductForm(!showCreateProductForm)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Create Product Form */}
                {showCreateProductForm && (
                  <div className="mb-4 p-4 border rounded-lg bg-muted/50">
                    <form onSubmit={handleCreateProduct} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Input
                            type="text"
                            value={newProductName}
                            onChange={(e) => setNewProductName(e.target.value)}
                            placeholder="Product name"
                            autoFocus
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={newProductPrice}
                            onChange={(e) => setNewProductPrice(e.target.value)}
                            placeholder="Sale price"
                          />
                        </div>
                        <div>
                          <select
                            value={newProductCategoryId}
                            onChange={(e) => setNewProductCategoryId(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select category</option>
                            {categories.map((category: { id: string; name: string }) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <select
                            value={newProductUnitId}
                            onChange={(e) => setNewProductUnitId(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select unit</option>
                            {units.map((unit: { id: string; name: string }) => (
                              <option key={unit.id} value={unit.id}>
                                {unit.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          disabled={createProductMutation.isPending || !newProductName.trim() || !newProductPrice.trim() || !newProductCategoryId || !newProductUnitId}
                        >
                          {createProductMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Create"
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowCreateProductForm(false);
                            setNewProductName("");
                            setNewProductPrice("");
                            setNewProductCategoryId("");
                            setNewProductUnitId("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Sale Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Avg Cost</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productsLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          </TableCell>
                        </TableRow>
                      ) : products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            No products found. Create your first product to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        products.map((product: { id: string; name: string; salePrice: number; quantity: number; averageCost: number; categoryId: string; unitId: string; category: { name: string }; unit: { name: string } }) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              {editingProduct?.id === product.id ? (
                                <Input
                                  type="text"
                                  value={editProductName}
                                  onChange={(e) => setEditProductName(e.target.value)}
                                  className="h-8"
                                  autoFocus
                                />
                              ) : (
                                <span className="font-medium">{product.name}</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {editingProduct?.id === product.id ? (
                                <select
                                  value={editProductCategoryId}
                                  onChange={(e) => setEditProductCategoryId(e.target.value)}
                                  className="h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                                >
                                  {categories.map((category: { id: string; name: string }) => (
                                    <option key={category.id} value={category.id}>
                                      {category.name}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span>{product.category?.name}</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {editingProduct?.id === product.id ? (
                                <select
                                  value={editProductUnitId}
                                  onChange={(e) => setEditProductUnitId(e.target.value)}
                                  className="h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                                >
                                  {units.map((unit: { id: string; name: string }) => (
                                    <option key={unit.id} value={unit.id}>
                                      {unit.name}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span>{product.unit?.name}</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {editingProduct?.id === product.id ? (
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={editProductPrice}
                                  onChange={(e) => setEditProductPrice(e.target.value)}
                                  className="h-8 w-20"
                                />
                              ) : (
                                <span>${product.salePrice.toFixed(2)}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">{product.quantity}</TableCell>
                            <TableCell className="text-muted-foreground">${product.averageCost.toFixed(2)}</TableCell>
                            <TableCell>
                              {editingProduct?.id === product.id ? (
                                <div className="flex gap-1">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleUpdateProduct}
                                    disabled={updateProductMutation.isPending || !editProductName.trim() || !editProductPrice.trim() || !editProductCategoryId || !editProductUnitId}
                                  >
                                    {updateProductMutation.isPending ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      "Save"
                                    )}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={cancelEditProduct}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => startEditProduct(product)}
                                    className="h-8 w-8"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === "purchases" && (
            <Card>
              <CardHeader>
                <CardTitle>Record Stock Purchase</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Purchase Recording Form */}
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h3 className="text-lg font-medium mb-4">Record New Purchase</h3>
                    <form onSubmit={handleRecordPurchase} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Product</label>
                          <select
                            value={selectedProductForPurchase}
                            onChange={(e) => setSelectedProductForPurchase(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select product</option>
                            {products.map((product: { id: string; name: string; unit: { name: string } }) => (
                              <option key={product.id} value={product.id}>
                                {product.name} ({product.unit?.name})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Quantity</label>
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            value={purchaseQuantity}
                            onChange={(e) => setPurchaseQuantity(e.target.value)}
                            placeholder="Enter quantity"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Cost Per Unit ($)</label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={purchaseCostPerUnit}
                            onChange={(e) => setPurchaseCostPerUnit(e.target.value)}
                            placeholder="Enter cost per unit"
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={createPurchaseMutation.isPending || !selectedProductForPurchase || !purchaseQuantity.trim() || !purchaseCostPerUnit.trim()}
                        className="w-full md:w-auto"
                      >
                        {createPurchaseMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <ShoppingCart className="h-4 w-4 mr-2" />
                        )}
                        Record Purchase
                      </Button>
                    </form>
                  </div>

                  {/* Purchase History */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Purchase History</h3>
                    <div className="mb-4">
                      <label className="text-sm font-medium mb-2 block">Filter by product</label>
                      <select
                        value={selectedProductForHistory}
                        onChange={(e) => setSelectedProductForHistory(e.target.value)}
                        className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">All Purchases</option>
                        {products.map((product: { id: string; name: string; unit: { name: string } }) => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.unit?.name})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {!selectedProductForHistory && <TableHead>Product</TableHead>}
                            <TableHead>Date</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Cost Per Unit</TableHead>
                            <TableHead>Total Cost</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {purchaseHistoryLoading ? (
                            <TableRow>
                              <TableCell colSpan={!selectedProductForHistory ? 5 : 4} className="text-center text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                              </TableCell>
                            </TableRow>
                          ) : purchaseHistory.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={!selectedProductForHistory ? 5 : 4} className="text-center text-muted-foreground">
                                {selectedProductForHistory 
                                  ? "No purchase history found for this product."
                                  : "No purchase records found."}
                              </TableCell>
                            </TableRow>
                          ) : (
                            purchaseHistory.map((purchase: { id: string; quantity: number; costPerUnit: number; purchaseDate: Date | string; product: { name: string } }) => (
                              <TableRow key={purchase.id}>
                                {!selectedProductForHistory && (
                                  <TableCell className="font-medium">
                                    {purchase.product?.name}
                                  </TableCell>
                                )}
                                <TableCell>
                                  {new Date(purchase.purchaseDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>{purchase.quantity}</TableCell>
                                <TableCell>${purchase.costPerUnit.toFixed(2)}</TableCell>
                                <TableCell>${(purchase.quantity * purchase.costPerUnit).toFixed(2)}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("purchases")}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Record Purchase
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Category Confirmation Dialog */}
      <Dialog open={!!deleteCategoryConfirm} onOpenChange={() => setDeleteCategoryConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteCategoryConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteCategoryConfirm && handleDeleteCategory(deleteCategoryConfirm)}
              disabled={deleteCategoryMutation.isPending}
            >
              {deleteCategoryMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Unit Confirmation Dialog */}
      <Dialog open={!!deleteUnitConfirm} onOpenChange={() => setDeleteUnitConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete Unit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this unit? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteUnitConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteUnitConfirm && handleDeleteUnit(deleteUnitConfirm)}
              disabled={deleteUnitMutation.isPending}
            >
              {deleteUnitMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}