"use client";

import { Settings, Loader2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "~/app/providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  // Form state for business profile
  const [formData, setFormData] = useState({
    shopName: "",
    address: "",
    phoneNumber: "",
    contactEmail: "",
    logoUrl: "",
    lowStockThreshold: 5,
  });

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Query for existing business profile
  const { data: businessProfile, isLoading: profileLoading, refetch } = api.settings.getBusinessProfile.useQuery();

  // Mutation for saving business profile
  const saveProfileMutation = api.settings.createOrUpdateBusinessProfile.useMutation({
    onSuccess: () => {
      refetch();
      alert("Business profile saved successfully!");
    },
    onError: (error) => {
      alert(`Failed to save business profile: ${error.message}`);
    },
  });

  // Load existing profile data when available
  useEffect(() => {
    if (businessProfile) {
      setFormData({
        shopName: businessProfile.shopName,
        address: businessProfile.address || "",
        phoneNumber: businessProfile.phoneNumber || "",
        contactEmail: businessProfile.contactEmail || "",
        logoUrl: businessProfile.logoUrl || "",
        lowStockThreshold: businessProfile.lowStockThreshold,
      });
    }
  }, [businessProfile]);

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.shopName.trim()) {
      newErrors.shopName = "Shop name is required";
    }
    
    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address";
    }
    
    if (formData.logoUrl && !/^https?:\/\/.+/.test(formData.logoUrl)) {
      newErrors.logoUrl = "Please enter a valid URL";
    }
    
    if (formData.lowStockThreshold < 0 || formData.lowStockThreshold > 999) {
      newErrors.lowStockThreshold = "Low stock threshold must be between 0 and 999";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    saveProfileMutation.mutate({
      shopName: formData.shopName.trim(),
      address: formData.address.trim() || undefined,
      phoneNumber: formData.phoneNumber.trim() || undefined,
      contactEmail: formData.contactEmail.trim() || undefined,
      logoUrl: formData.logoUrl.trim() || undefined,
      lowStockThreshold: formData.lowStockThreshold,
    });
  };

  if (profileLoading) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-center min-h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your business profile and shop configuration</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Business Profile
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure your business information for reports and customer communications
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Shop Name */}
              <div className="space-y-2">
                <Label htmlFor="shopName">
                  Shop Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="shopName"
                  type="text"
                  value={formData.shopName}
                  onChange={(e) => handleInputChange("shopName", e.target.value)}
                  placeholder="Enter your shop name"
                  className={errors.shopName ? "border-destructive" : ""}
                  required
                />
                {errors.shopName && (
                  <p className="text-sm text-destructive">{errors.shopName}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Contact Email */}
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  placeholder="Enter your contact email"
                  className={errors.contactEmail ? "border-destructive" : ""}
                />
                {errors.contactEmail && (
                  <p className="text-sm text-destructive">{errors.contactEmail}</p>
                )}
              </div>

              {/* Low Stock Threshold */}
              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  min="0"
                  max="999"
                  value={formData.lowStockThreshold}
                  onChange={(e) => handleInputChange("lowStockThreshold", parseInt(e.target.value) || 0)}
                  placeholder="5"
                  className={errors.lowStockThreshold ? "border-destructive" : ""}
                />
                {errors.lowStockThreshold && (
                  <p className="text-sm text-destructive">{errors.lowStockThreshold}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Alert when product quantity falls below this number
                </p>
              </div>
            </div>

            {/* Address - Full width */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter your business address"
              />
            </div>

            {/* Logo URL - Full width */}
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Company Logo URL</Label>
              <Input
                id="logoUrl"
                type="url"
                value={formData.logoUrl}
                onChange={(e) => handleInputChange("logoUrl", e.target.value)}
                placeholder="https://example.com/logo.png"
                className={errors.logoUrl ? "border-destructive" : ""}
              />
              {errors.logoUrl && (
                <p className="text-sm text-destructive">{errors.logoUrl}</p>
              )}
              <p className="text-xs text-muted-foreground">
                URL to your company logo for use in reports and documents
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saveProfileMutation.isPending}
              >
                {saveProfileMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Business Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}