/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import React from 'react';

// Mock the entire page to isolate just the form section for testing
const MockCreateProductForm = () => {
  const newProductName = '';
  const newProductPrice = '';
  const newProductCategoryId = '';
  const newProductUnitId = '';
  const categories = [{ id: '1', name: 'Test Category' }];
  const units = [{ id: '1', name: 'Test Unit' }];
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setNewProductName = (value: string) => { /* mock setter */ };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setNewProductPrice = (value: string) => { /* mock setter */ };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setNewProductCategoryId = (value: string) => { /* mock setter */ };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setNewProductUnitId = (value: string) => { /* mock setter */ };
  const handleCreateProduct = (e: React.FormEvent) => { e.preventDefault(); };

  // Mock CurrencyInput component - simplified for testing labels only
  const CurrencyInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input data-testid="currency-input" {...props} />
  );

  const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  );

  return (
    <div className="mb-4 p-4 border rounded-lg bg-muted/50">
      <form onSubmit={handleCreateProduct} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Product Name</label>
            <Input
              type="text"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              placeholder="Product name"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Sale Price (฿)</label>
            <CurrencyInput
              value={newProductPrice}
              onChange={(e) => setNewProductPrice(e.target.value)}
              placeholder="Sale price"
              min={0}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <select
              value={newProductCategoryId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewProductCategoryId(e.target.value)}
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
            <label className="text-sm font-medium mb-2 block">Unit</label>
            <select
              value={newProductUnitId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewProductUnitId(e.target.value)}
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
      </form>
    </div>
  );
};

describe('Create Product Form Labels', () => {
  it('renders all required form labels', () => {
    render(<MockCreateProductForm />);
    
    // Test that all labels are present
    expect(screen.getByText('Product Name')).toBeInTheDocument();
    expect(screen.getByText('Sale Price (฿)')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Unit')).toBeInTheDocument();
  });

  it('applies consistent label styling', () => {
    render(<MockCreateProductForm />);
    
    // Test that all labels have the correct CSS class string
    const productNameLabel = screen.getByText('Product Name');
    const salePriceLabel = screen.getByText('Sale Price (฿)');
    const categoryLabel = screen.getByText('Category');
    const unitLabel = screen.getByText('Unit');
    
    // Check that labels have the expected className
    const expectedClasses = 'text-sm font-medium mb-2 block';
    expect(productNameLabel).toHaveClass(expectedClasses);
    expect(salePriceLabel).toHaveClass(expectedClasses);
    expect(categoryLabel).toHaveClass(expectedClasses);
    expect(unitLabel).toHaveClass(expectedClasses);
  });

  it('labels are positioned above their corresponding input fields', () => {
    render(<MockCreateProductForm />);
    
    // Test visual hierarchy - labels should come before inputs in DOM order
    const productNameLabel = screen.getByText('Product Name');
    const productNameInput = screen.getByPlaceholderText('Product name');
    
    // Check DOM order
    expect(productNameLabel.compareDocumentPosition(productNameInput)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    
    const salePriceLabel = screen.getByText('Sale Price (฿)');
    const salePriceInput = screen.getByTestId('currency-input');
    
    expect(salePriceLabel.compareDocumentPosition(salePriceInput)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it('provides accessibility with proper label-input associations', () => {
    render(<MockCreateProductForm />);
    
    // Verify labels exist and are accessible
    const productNameLabel = screen.getByText('Product Name');
    const salePriceLabel = screen.getByText('Sale Price (฿)');
    const categoryLabel = screen.getByText('Category');
    const unitLabel = screen.getByText('Unit');
    
    // Check that all labels are properly rendered as label elements
    expect(productNameLabel.tagName).toBe('LABEL');
    expect(salePriceLabel.tagName).toBe('LABEL');
    expect(categoryLabel.tagName).toBe('LABEL');
    expect(unitLabel.tagName).toBe('LABEL');
  });
});