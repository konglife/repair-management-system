"use client";

import {
  Package,
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Ruler,
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";
import { api } from "~/app/providers";
import { formatCurrency, formatDisplayDate, matchesAmount } from "~/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "~/components/ui/CurrencyInput";
import { ProductPicker } from "~/components/ui/pickers";
import { DataTable, type Column } from "~/components/ui/DataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/DatePicker";

type CategoryRow = {
  id: string;
  name: string;
  _count?: { products: number };
};

type UnitRow = {
  id: string;
  name: string;
  _count?: { products: number };
};

type ProductRow = {
  id: string;
  name: string;
  salePrice: number;
  quantity: number;
  averageCost: number;
  categoryId: string;
  unitId: string;
  category?: { name: string };
  unit?: { name: string };
};

type PurchaseRow = {
  id: string;
  quantity: number;
  costPerUnit: number;
  purchaseDate: Date | string;
  product?: { name: string };
};

// Raw (trimmed, non-empty) term — DataTable handles the empty short-circuit.
const categoryPredicate = (row: CategoryRow, term: string) =>
  row.name.toLowerCase().includes(term.toLowerCase());

const unitPredicate = (row: UnitRow, term: string) =>
  row.name.toLowerCase().includes(term.toLowerCase());

const productPredicate = (row: ProductRow, term: string) => {
  const t = term.toLowerCase();
  return (
    row.name.toLowerCase().includes(t) ||
    !!row.category?.name.toLowerCase().includes(t)
  );
};

const purchasePredicate = (row: PurchaseRow, term: string) => {
  const t = term.toLowerCase();
  const productMatch = !!row.product?.name.toLowerCase().includes(t);
  const dateMatch = formatDisplayDate(row.purchaseDate)
    .toLowerCase()
    .includes(t);
  const qtyMatch = row.quantity.toString().includes(t);
  const costMatch = matchesAmount(row.costPerUnit, t);
  const total = row.quantity * row.costPerUnit;
  const totalMatch = matchesAmount(total, t);
  return productMatch || dateMatch || qtyMatch || costMatch || totalMatch;
};

export default function StockPage() {
  const [activeTab, setActiveTab] = useState<
    "categories" | "units" | "products" | "purchases"
  >("products");

  // Categories state
  const [showCreateCategoryForm, setShowCreateCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<
    string | null
  >(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editCategoryName, setEditCategoryName] = useState("");

  // Units state
  const [showCreateUnitForm, setShowCreateUnitForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteUnitConfirm, setDeleteUnitConfirm] = useState<string | null>(
    null
  );
  const [newUnitName, setNewUnitName] = useState("");
  const [editUnitName, setEditUnitName] = useState("");

  // Products state
  const [showCreateProductForm, setShowCreateProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<{
    id: string;
    name: string;
    salePrice: number;
    categoryId: string;
    unitId: string;
  } | null>(null);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductCategoryId, setNewProductCategoryId] = useState("");
  const [newProductUnitId, setNewProductUnitId] = useState("");
  const [editProductName, setEditProductName] = useState("");
  const [editProductPrice, setEditProductPrice] = useState("");
  const [editProductCategoryId, setEditProductCategoryId] = useState("");
  const [editProductUnitId, setEditProductUnitId] = useState("");

  // Purchase recording state
  const [showCreatePurchaseForm, setShowCreatePurchaseForm] = useState(false);
  const [selectedProductForPurchase, setSelectedProductForPurchase] =
    useState("");
  const [purchaseQuantity, setPurchaseQuantity] = useState("");
  const [purchaseCostPerUnit, setPurchaseCostPerUnit] = useState("");
  const [purchaseDate, setPurchaseDate] = useState<Date>(new Date());
  const [selectedProductForHistory, setSelectedProductForHistory] =
    useState("");

  // tRPC queries and mutations for categories
  const {
    data: categories = [],
    refetch: refetchCategories,
    isLoading: categoriesLoading,
  } = api.categories.getAll.useQuery();

  // tRPC query for total stock value
  const {
    data: totalValue = 0,
    isLoading: totalValueLoading,
    error: totalValueError,
  } = api.products.getTotalValue.useQuery();

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
  const {
    data: units = [],
    refetch: refetchUnits,
    isLoading: unitsLoading,
  } = api.units.getAll.useQuery();

  // tRPC queries and mutations for products
  const {
    data: products = [],
    refetch: refetchProducts,
    isLoading: productsLoading,
  } = api.products.getAll.useQuery();

  // tRPC queries and mutations for purchases
  const {
    data: allPurchases = [],
    refetch: refetchAllPurchases,
    isLoading: allPurchasesLoading,
  } = api.purchases.getAll.useQuery();

  const {
    data: productPurchases = [],
    refetch: refetchProductPurchases,
    isLoading: productPurchasesLoading,
  } = api.purchases.getByProduct.useQuery(
    { productId: selectedProductForHistory },
    { enabled: !!selectedProductForHistory }
  );

  // Determine loading state for purchases
  const purchaseHistoryLoading = selectedProductForHistory
    ? productPurchasesLoading
    : allPurchasesLoading;

  // Base rows for the purchase-history table: pre-filtered by the selected
  // product (or all purchases). DataTable's search layers on top of this.
  const purchaseHistoryRows = selectedProductForHistory
    ? productPurchases
    : allPurchases;

  const createPurchaseMutation = api.purchases.create.useMutation({
    onSuccess: () => {
      refetchProducts();
      refetchAllPurchases();
      if (selectedProductForHistory) {
        refetchProductPurchases();
      }
      setShowCreatePurchaseForm(false);
      setSelectedProductForPurchase("");
      setPurchaseQuantity("");
      setPurchaseCostPerUnit("");
      setPurchaseDate(new Date());
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
      name: editCategoryName.trim(),
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
      name: editUnitName.trim(),
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
    if (
      !newProductName.trim() ||
      !newProductPrice.trim() ||
      !newProductCategoryId ||
      !newProductUnitId
    )
      return;
    const salePrice = parseFloat(newProductPrice);
    if (isNaN(salePrice) || salePrice < 0) {
      alert("Please enter a valid sale price");
      return;
    }
    createProductMutation.mutate({
      name: newProductName.trim(),
      salePrice,
      categoryId: newProductCategoryId,
      unitId: newProductUnitId,
    });
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !editingProduct ||
      !editProductName.trim() ||
      !editProductPrice.trim() ||
      !editProductCategoryId ||
      !editProductUnitId
    )
      return;
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
      unitId: editProductUnitId,
    });
  };

  const startEditProduct = (product: {
    id: string;
    name: string;
    salePrice: number;
    categoryId: string;
    unitId: string;
  }) => {
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
    if (
      !selectedProductForPurchase ||
      !purchaseQuantity.trim() ||
      !purchaseCostPerUnit.trim()
    )
      return;

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
      costPerUnit,
      purchaseDate: new Date(
        purchaseDate.getFullYear(),
        purchaseDate.getMonth(),
        purchaseDate.getDate(),
        12,
        0,
        0
      ),
    });
  };

  const categoryColumns: Column<CategoryRow>[] = [
    {
      header: "Name",
      cell: (c) =>
        editingCategory?.id === c.id ? (
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
              disabled={
                updateCategoryMutation.isPending || !editCategoryName.trim()
              }
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
          <span className="font-medium">{c.name}</span>
        ),
    },
    {
      header: "Products",
      className: "text-muted-foreground",
      cell: (c) => c._count?.products ?? 0,
    },
    {
      header: "Actions",
      cell: (c) =>
        editingCategory?.id === c.id ? null : (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => startEditCategory(c)}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteCategoryConfirm(c.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
    },
  ];

  const unitColumns: Column<UnitRow>[] = [
    {
      header: "Name",
      cell: (u) =>
        editingUnit?.id === u.id ? (
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
          <span className="font-medium">{u.name}</span>
        ),
    },
    {
      header: "Products",
      className: "text-muted-foreground",
      cell: (u) => u._count?.products ?? 0,
    },
    {
      header: "Actions",
      cell: (u) =>
        editingUnit?.id === u.id ? null : (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => startEditUnit(u)}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteUnitConfirm(u.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
    },
  ];

  const productColumns: Column<ProductRow>[] = [
    {
      header: "Name",
      cell: (p) =>
        editingProduct?.id === p.id ? (
          <Input
            type="text"
            value={editProductName}
            onChange={(e) => setEditProductName(e.target.value)}
            className="h-8"
            autoFocus
          />
        ) : (
          <span className="font-medium">{p.name}</span>
        ),
    },
    {
      header: "Category",
      cell: (p) =>
        editingProduct?.id === p.id ? (
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
          <span>{p.category?.name}</span>
        ),
    },
    {
      header: "Unit",
      cell: (p) =>
        editingProduct?.id === p.id ? (
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
          <span>{p.unit?.name}</span>
        ),
    },
    {
      header: "Sale Price",
      cell: (p) =>
        editingProduct?.id === p.id ? (
          <CurrencyInput
            value={editProductPrice ? parseFloat(editProductPrice) : undefined}
            onChange={(value) => setEditProductPrice(value?.toString() ?? "")}
            className="h-8 w-20"
            min={0}
          />
        ) : (
          <span>{formatCurrency(p.salePrice)}</span>
        ),
    },
    {
      header: "Quantity",
      className: "text-muted-foreground",
      cell: (p) => p.quantity,
    },
    {
      header: "Avg Cost",
      className: "text-muted-foreground",
      cell: (p) => formatCurrency(p.averageCost),
    },
    {
      header: "Actions",
      cell: (p) =>
        editingProduct?.id === p.id ? (
          <div className="flex gap-1">
            <Button
              type="button"
              size="sm"
              onClick={handleUpdateProduct}
              disabled={
                updateProductMutation.isPending ||
                !editProductName.trim() ||
                !editProductPrice.trim() ||
                !editProductCategoryId ||
                !editProductUnitId
              }
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
              onClick={() => startEditProduct(p)}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        ),
    },
  ];

  const purchaseHistoryColumns: Column<PurchaseRow>[] =
    selectedProductForHistory
      ? [
          {
            header: "Date",
            cell: (p) => formatDisplayDate(p.purchaseDate),
          },
          { header: "Quantity", cell: (p) => p.quantity },
          {
            header: "Cost Per Unit",
            cell: (p) => formatCurrency(p.costPerUnit),
          },
          {
            header: "Total Cost",
            cell: (p) => formatCurrency(p.quantity * p.costPerUnit),
          },
        ]
      : [
          {
            header: "Product",
            className: "font-medium",
            cell: (p) => p.product?.name,
          },
          {
            header: "Date",
            cell: (p) => formatDisplayDate(p.purchaseDate),
          },
          { header: "Quantity", cell: (p) => p.quantity },
          {
            header: "Cost Per Unit",
            cell: (p) => formatCurrency(p.costPerUnit),
          },
          {
            header: "Total Cost",
            cell: (p) => formatCurrency(p.quantity * p.costPerUnit),
          },
        ];

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Stock Management
          </h2>
          <p className="text-muted-foreground">
            Manage your inventory, categories, and stock levels
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Categories
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Product categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Ruler className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{units.length}</div>
            <p className="text-xs text-muted-foreground">Measurement units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Items in inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalValueLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : totalValueError ? (
                <span className="text-destructive">Error</span>
              ) : (
                formatCurrency(totalValue)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalValueError
                ? "Failed to load inventory value"
                : "Inventory value"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
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
      </div>

      <div className="grid gap-6">
        <div>
          {activeTab === "categories" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Categories</CardTitle>
                  <Button
                    onClick={() =>
                      setShowCreateCategoryForm(!showCreateCategoryForm)
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Create Category Form */}
                {showCreateCategoryForm && (
                  <div className="mb-4 p-4 border rounded-lg bg-muted/50">
                    <form
                      onSubmit={handleCreateCategory}
                      className="flex gap-2"
                    >
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
                        disabled={
                          createCategoryMutation.isPending ||
                          !newCategoryName.trim()
                        }
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

                <DataTable
                  rows={categories}
                  columns={categoryColumns}
                  search={{
                    placeholder: "Search categories...",
                    predicate: categoryPredicate,
                  }}
                  loading={categoriesLoading}
                  emptyMessage="No categories found. Create your first category to get started."
                  emptySearchMessage="No categories found matching your search."
                  pagination={{ pageSize: 25 }}
                />
              </CardContent>
            </Card>
          )}
          {activeTab === "units" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Units</CardTitle>
                  <Button
                    onClick={() => setShowCreateUnitForm(!showCreateUnitForm)}
                  >
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
                        disabled={
                          createUnitMutation.isPending || !newUnitName.trim()
                        }
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

                <DataTable
                  rows={units}
                  columns={unitColumns}
                  search={{
                    placeholder: "Search units...",
                    predicate: unitPredicate,
                  }}
                  loading={unitsLoading}
                  emptyMessage="No units found. Create your first unit to get started."
                  emptySearchMessage="No units found matching your search."
                  pagination={{ pageSize: 25 }}
                />
              </CardContent>
            </Card>
          )}
          {activeTab === "products" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Products</CardTitle>
                  <Button
                    onClick={() =>
                      setShowCreateProductForm(!showCreateProductForm)
                    }
                  >
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
                          <label className="text-sm font-medium mb-2 block">
                            Product Name
                          </label>
                          <Input
                            type="text"
                            value={newProductName}
                            onChange={(e) => setNewProductName(e.target.value)}
                            placeholder="Product name"
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Sale Price (฿)
                          </label>
                          <CurrencyInput
                            value={
                              newProductPrice
                                ? parseFloat(newProductPrice)
                                : undefined
                            }
                            onChange={(value) =>
                              setNewProductPrice(value?.toString() ?? "")
                            }
                            placeholder="Sale price"
                            min={0}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Category
                          </label>
                          <select
                            value={newProductCategoryId}
                            onChange={(e) =>
                              setNewProductCategoryId(e.target.value)
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select category</option>
                            {categories.map(
                              (category: { id: string; name: string }) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Unit
                          </label>
                          <select
                            value={newProductUnitId}
                            onChange={(e) =>
                              setNewProductUnitId(e.target.value)
                            }
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
                          disabled={
                            createProductMutation.isPending ||
                            !newProductName.trim() ||
                            !newProductPrice.trim() ||
                            !newProductCategoryId ||
                            !newProductUnitId
                          }
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

                <DataTable
                  rows={products}
                  columns={productColumns}
                  search={{
                    placeholder: "Search products by name or category...",
                    predicate: productPredicate,
                  }}
                  loading={productsLoading}
                  emptyMessage="No products found. Create your first product to get started."
                  emptySearchMessage="No products found matching your search."
                  pagination={{ pageSize: 25 }}
                />
              </CardContent>
            </Card>
          )}
          {activeTab === "purchases" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Record Stock Purchase</CardTitle>
                  <Button
                    onClick={() =>
                      setShowCreatePurchaseForm(!showCreatePurchaseForm)
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Purchase
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Purchase Recording Form */}
                  {showCreatePurchaseForm && (
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <h3 className="text-lg font-medium mb-4">
                        Record New Purchase
                      </h3>
                      <form
                        onSubmit={handleRecordPurchase}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              Product
                            </label>
                            <ProductPicker
                              products={products}
                              variant="purchase"
                              value={selectedProductForPurchase}
                              onValueChange={setSelectedProductForPurchase}
                              placeholder="Search for a product to purchase..."
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              Quantity
                            </label>
                            <Input
                              type="number"
                              min="1"
                              step="1"
                              value={purchaseQuantity}
                              onChange={(e) =>
                                setPurchaseQuantity(e.target.value)
                              }
                              placeholder="Enter quantity"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              Cost Per Unit (฿)
                            </label>
                            <CurrencyInput
                              value={
                                purchaseCostPerUnit
                                  ? parseFloat(purchaseCostPerUnit)
                                  : undefined
                              }
                              onChange={(value) =>
                                setPurchaseCostPerUnit(value?.toString() ?? "")
                              }
                              placeholder="Enter cost per unit"
                              min={0}
                            />
                          </div>
                          <DatePicker
                            id="purchase-date"
                            label="Purchase Date"
                            value={purchaseDate}
                            onChange={(date) => date && setPurchaseDate(date)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={
                              createPurchaseMutation.isPending ||
                              !selectedProductForPurchase ||
                              !purchaseQuantity.trim() ||
                              !purchaseCostPerUnit.trim()
                            }
                          >
                            {createPurchaseMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <ShoppingCart className="h-4 w-4 mr-2" />
                            )}
                            Record Purchase
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowCreatePurchaseForm(false);
                              setSelectedProductForPurchase("");
                              setPurchaseQuantity("");
                              setPurchaseCostPerUnit("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Purchase History */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Purchase History
                    </h3>

                    <div className="mb-4">
                      <label className="text-sm font-medium mb-2 block">
                        Filter by product
                      </label>
                      <select
                        value={selectedProductForHistory}
                        onChange={(e) =>
                          setSelectedProductForHistory(e.target.value)
                        }
                        className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">All Purchases</option>
                        {products.map(
                          (product: {
                            id: string;
                            name: string;
                            unit: { name: string };
                          }) => (
                            <option key={product.id} value={product.id}>
                              {product.name} ({product.unit?.name})
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <DataTable
                      rows={purchaseHistoryRows}
                      columns={purchaseHistoryColumns}
                      search={{
                        placeholder:
                          "Search purchase history by product, date, or amount...",
                        predicate: purchasePredicate,
                      }}
                      loading={purchaseHistoryLoading}
                      emptyMessage={
                        selectedProductForHistory
                          ? "No purchase history found for this product."
                          : "No purchase records found."
                      }
                      emptySearchMessage="No purchase records found matching your search."
                      pagination={{ pageSize: 25 }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Category Confirmation Dialog */}
      <Dialog
        open={!!deleteCategoryConfirm}
        onOpenChange={() => setDeleteCategoryConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot
              be undone.
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
              onClick={() =>
                deleteCategoryConfirm &&
                handleDeleteCategory(deleteCategoryConfirm)
              }
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
      <Dialog
        open={!!deleteUnitConfirm}
        onOpenChange={() => setDeleteUnitConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete Unit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this unit? This action cannot be
              undone.
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
              onClick={() =>
                deleteUnitConfirm && handleDeleteUnit(deleteUnitConfirm)
              }
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
