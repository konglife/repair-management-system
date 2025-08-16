"use client";

import { Package, FolderOpen, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { api } from "~/app/providers";

export default function StockPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editCategoryName, setEditCategoryName] = useState("");

  // tRPC queries and mutations
  const { data: categories = [], refetch, isLoading } = api.categories.getAll.useQuery();
  
  const createMutation = api.categories.create.useMutation({
    onSuccess: (data) => {
      console.log("Category created successfully:", data);
      refetch();
      setShowCreateForm(false);
      setNewCategoryName("");
    },
    onError: (error) => {
      console.error("Category creation error:", error);
      alert(`Failed to create category: ${error.message}`);
    },
  });

  const updateMutation = api.categories.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingCategory(null);
      setEditCategoryName("");
    },
    onError: (error) => {
      console.error("Category update error:", error);
      alert(`Failed to update category: ${error.message}`);
    },
  });

  const deleteMutation = api.categories.delete.useMutation({
    onSuccess: () => {
      refetch();
      setDeleteConfirm(null);
    },
    onError: (error) => {
      console.error("Category deletion error:", error);
      alert(`Failed to delete category: ${error.message}`);
      setDeleteConfirm(null);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    createMutation.mutate({ name: newCategoryName.trim() });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editCategoryName.trim()) return;
    updateMutation.mutate({ 
      id: editingCategory.id, 
      name: editCategoryName.trim() 
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id });
  };

  const startEdit = (category: { id: string; name: string }) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditCategoryName("");
  };
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Stock Management</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Total Categories</p>
              <p className="text-2xl font-bold">{categories.length}</p>
            </div>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Total Products</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Low Stock Items</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Total Value</p>
              <p className="text-2xl font-bold">$0</p>
            </div>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Categories</h3>
                <button 
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </button>
              </div>

              {/* Create Category Form */}
              {showCreateForm && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <form onSubmit={handleCreate} className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Category name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={createMutation.isPending || !newCategoryName.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Create"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewCategoryName("");
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              )}

              <div className="mt-4">
                <div className="rounded-md border">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Products</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {isLoading ? (
                          <tr>
                            <td className="p-4 align-middle text-center text-muted-foreground" colSpan={3}>
                              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            </td>
                          </tr>
                        ) : categories.length === 0 ? (
                          <tr>
                            <td className="p-4 align-middle text-center text-muted-foreground" colSpan={3}>
                              No categories found. Create your first category to get started.
                            </td>
                          </tr>
                        ) : (
                          categories.map((category: { id: string; name: string }) => (
                            <tr key={category.id} className="border-b transition-colors hover:bg-muted/50">
                              <td className="p-4 align-middle">
                                {editingCategory?.id === category.id ? (
                                  <form onSubmit={handleUpdate} className="flex gap-2">
                                    <input
                                      type="text"
                                      value={editCategoryName}
                                      onChange={(e) => setEditCategoryName(e.target.value)}
                                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      autoFocus
                                    />
                                    <button
                                      type="submit"
                                      disabled={updateMutation.isPending || !editCategoryName.trim()}
                                      className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                                    >
                                      {updateMutation.isPending ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        "Save"
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={cancelEdit}
                                      className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
                                    >
                                      Cancel
                                    </button>
                                  </form>
                                ) : (
                                  <span className="font-medium">{category.name}</span>
                                )}
                              </td>
                              <td className="p-4 align-middle text-muted-foreground">0</td>
                              <td className="p-4 align-middle">
                                {editingCategory?.id === category.id ? null : (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => startEdit(category)}
                                      className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                      title="Edit category"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm(category.id)}
                                      className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                      title="Delete category"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3">
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium">Quick Actions</h3>
              <div className="mt-4 space-y-2">
                <button className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </button>
                <button className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                  <Package className="h-4 w-4 mr-2" />
                  Record Purchase
                </button>
                <button className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  View Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this category? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}