"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { SearchInput } from "~/components/ui/SearchInput";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, cn } from "~/lib/utils";

interface Product {
  id: string;
  name: string;
  salePrice: number;
  quantity: number;
}

interface ProductAutocompleteProps {
  products: Product[];
  value?: string;
  onValueChange: (productId: string) => void;
  placeholder?: string;
  className?: string;
}

export function ProductAutocomplete({ 
  products, 
  value, 
  onValueChange, 
  placeholder = "Search for a product...",
  className 
}: ProductAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter products with stock and by search term
  const filteredProducts = useMemo(() => {
    const availableProducts = products.filter(product => product.quantity > 0);
    
    if (!searchTerm.trim()) {
      return availableProducts;
    }
    
    const search = searchTerm.toLowerCase();
    return availableProducts.filter(product =>
      product.name.toLowerCase().includes(search)
    );
  }, [products, searchTerm]);

  // Get selected product
  const selectedProduct = products.find(p => p.id === value);

  // Handle product selection
  const handleSelect = (productId: string) => {
    onValueChange(productId);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Handle clear selection
  const handleClear = () => {
    onValueChange("");
    setSearchTerm("");
  };

  // Close dropdown when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          {/* Display selected product or search input */}
          {selectedProduct && !isOpen ? (
            <div className="flex items-center justify-between p-2 border rounded-md bg-background">
              <div className="flex-1">
                <span className="font-medium">{selectedProduct.name}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  {formatCurrency(selectedProduct.salePrice)} (Stock: {selectedProduct.quantity})
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(!isOpen)}
                  className="h-6 w-6 p-0"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <SearchInput
                placeholder={placeholder}
                value={searchTerm}
                onChange={(value) => {
                  setSearchTerm(value);
                  if (!isOpen) setIsOpen(true);
                }}
                debounceMs={0} // Immediate response for better UX
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="absolute right-1 top-1 h-7 w-7 p-0"
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown results */}
      {isOpen && (
        <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-auto">
          <CardContent className="p-0">
            {filteredProducts.length > 0 ? (
              <div className="py-1">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelect(product.id)}
                    className={cn(
                      "w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors",
                      "flex items-center justify-between",
                      value === product.id && "bg-accent text-accent-foreground"
                    )}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(product.salePrice)} • Stock: {product.quantity}
                      </div>
                    </div>
                    {value === product.id && (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {searchTerm.trim() 
                  ? "No products found matching your search." 
                  : "No products with stock available."
                }
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}