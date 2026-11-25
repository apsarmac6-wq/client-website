
"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

type Product = {
  id: string;
  name: string;
  name_ne: string | null;
  category: string;
  price: number;
  discount_price: number | null;
  description: string | null;
  description_ne: string | null;
  dimensions: string | null;
  material: string | null;
  availability: string;
  is_published: boolean;
};

const categories = [
  { value: "sofa", label: "Sofa" },
  { value: "bed", label: "Bed" },
  { value: "dining_table", label: "Dining Table" },
  { value: "wardrobe", label: "Wardrobe" },
  { value: "door_window", label: "Door & Window" },
  { value: "office_furniture", label: "Office Furniture" },
  { value: "kitchen_furniture", label: "Kitchen Furniture" },
  { value: "custom_made", label: "Custom Made" },
  { value: "other", label: "Other" },
];

export default function AdminDashboard() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [nameNe, setNameNe] = useState("");
  const [category, setCategory] = useState("sofa");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionNe, setDescriptionNe] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [material, setMaterial] = useState("");
  const [availability, setAvailability] = useState("available");
  const [isPublished, setIsPublished] = useState(true);
  const [images, setImages] = useState<File[]>([]);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setProducts((data || []) as Product[]);
    }
  }

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user }, error: authError } =
        await supabase.auth.getUser();

      if (authError || !user) {
        setError("Please log in to access the owner dashboard.");
        setLoading(false);
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("store_admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminError || !admin) {
        setError("You are not authorized to manage this store.");
        setLoading(false);
        return;
      }

      setAuthorized(true);
      await loadProducts();
      setLoading(false);
    }

    loadDashboard();
  }, []);

  function resetForm() {
    setEditingId(null);
    setName("");
    setNameNe("");
    setCategory("sofa");
    setPrice("");
    setDiscountPrice("");
    setDescription("");
    setDescriptionNe("");
    setDimensions("");
    setMaterial("");
    setAvailability("available");
    setIsPublished(true);
    setImages([]);
  }

  function startEditing(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setNameNe(product.name_ne || "");
    setCategory(product.category);
    setPrice(String(product.price));
    setDiscountPrice(
      product.discount_price === null
        ? ""
        : String(product.discount_price)
    );
    setDescription(product.description || "");
    setDescriptionNe(product.description_ne || "");
    setDimensions(product.dimensions || "");
    setMaterial(product.material || "");
    setAvailability(product.availability);
    setIsPublished(product.is_published);
    setImages([]);
    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (images.length > 5) {
        throw new Error("Please select no more than 5 new images.");
      }

      if (images.some(image => !image.type.startsWith("image/"))) {
        throw new Error("Please select image files only.");
      }

      const numericPrice = Number(price);
      const numericDiscount = discountPrice
        ? Number(discountPrice)
        : null;

      if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        throw new Error("Please enter a valid price.");
      }

      if (
        numericDiscount !== null &&
        (!Number.isFinite(numericDiscount) ||
          numericDiscount < 0 ||
          numericDiscount > numericPrice)
      ) {
        throw new Error(
          "Discount price must be valid and no higher than the original price."
        );
      }

      const productDetails = {
        name,
        name_ne: nameNe || null,
        category,
        price: numericPrice,
        discount_price: numericDiscount,
        description: description || null,
        description_ne: descriptionNe || null,
        dimensions: dimensions || null,
        material: material || null,
        availability,
        is_published: isPublished,
      };

      let productId = editingId;

      if (editingId) {
        // Update an existing product.
        const { error: updateError } = await supabase
          .from("products")
          .update(productDetails)
          .eq("id", editingId);

        if (updateError) throw updateError;

        // Check how many images are already saved.
        const { count, error: countError } = await supabase
          .from("product_images")
          .select("*", { count: "exact", head: true })
          .eq("product_id", editingId);

        if (countError) throw countError;

        if ((count || 0) + images.length > 5) {
          throw new Error(
            "This product can have a maximum of 5 images. Remove some existing images before adding more."
          );
        }
      } else {
        // Create a new product.
        const { data: product, error: insertError } = await supabase
          .from("products")
          .insert(productDetails)
          .select("id")
          .single();

        if (insertError) throw insertError;

        productId = product.id;
      }

      // Upload any newly selected images.
      const imageRecords = [];

      for (const image of images) {
        const extension = image.name.split(".").pop() || "jpg";
        const filePath =
          `${productId}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, image, {
            contentType: image.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        imageRecords.push({
          product_id: productId,
          image_url: publicUrlData.publicUrl,
          storage_path: filePath,
          alt_text: name,
        });
      }

      if (imageRecords.length > 0) {
        const { error: imageError } = await supabase
          .from("product_images")
          .insert(imageRecords);

        if (imageError) throw imageError;
      }

      resetForm();
      await loadProducts();

      setSuccess(
        editingId
          ? "Furniture updated successfully!"
          : "Furniture added successfully!"
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${product.name}"?`
    );

    if (!confirmed) return;

    setWorkingId(product.id);
    setError("");
    setSuccess("");

    try {
      // Find the product's stored images.
      const { data: imageRows, error: imageQueryError } = await supabase
        .from("product_images")
        .select("storage_path")
        .eq("product_id", product.id);

      if (imageQueryError) throw imageQueryError;

      const paths = (imageRows || [])
        .map(row => row.storage_path)
        .filter((path): path is string => Boolean(path));

      // Remove image files from Storage first.
      if (paths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("product-images")
          .remove(paths);

        if (storageError) throw storageError;
      }

      // Then delete the product.
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (deleteError) throw deleteError;

      if (editingId === product.id) {
        resetForm();
      }

      await loadProducts();
      setSuccess("Product deleted successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete product."
      );
    } finally {
      setWorkingId(null);
    }
  }

  async function togglePublish(product: Product) {
    setWorkingId(product.id);
    setError("");
    setSuccess("");

    try {
      const { error: updateError } = await supabase
        .from("products")
        .update({ is_published: !product.is_published })
        .eq("id", product.id);

      if (updateError) throw updateError;

      await loadProducts();

      setSuccess(
        product.is_published
          ? "Product unpublished successfully."
          : "Product published successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update product status."
      );
    } finally {
      setWorkingId(null);
    }
  }

  if (loading) {
    return <main className="p-10">Loading dashboard...</main>;
  }

  if (!authorized) {
    return (
      <main className="p-10">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-3">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f0e7] p-4 text-gray-900 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-[#593b25]">
          Langxong Furniture Udhyog
        </h1>

        <p className="mt-2 text-gray-600">
          सञ्चालक ड्यासबोर्ड — Furniture Management
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-gray-500">Total Products</p>
            <h2 className="mt-2 text-3xl font-bold">
              {products.length}
            </h2>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-gray-500">Published Products</p>
            <h2 className="mt-2 text-3xl font-bold">
              {products.filter(p => p.is_published).length}
            </h2>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-gray-500">Out of Stock</p>
            <h2 className="mt-2 text-3xl font-bold">
              {products.filter(p => p.availability === "out_of_stock").length}
            </h2>
          </div>
        </div>

        <section className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-6 text-2xl font-bold text-[#593b25]">
            {editingId ? "Edit Furniture" : "Add New Furniture"}
          </h2>

          <form onSubmit={saveProduct} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium">
                  Product Name (English) *
                </label>
                <input
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-lg border p-3"
                  placeholder="Example: Wooden Sofa"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">
                  Product Name (Nepali)
                </label>
                <input
                  value={nameNe}
                  onChange={e => setNameNe(e.target.value)}
                  className="w-full rounded-lg border p-3"
                  placeholder="फर्निचरको नाम"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block font-medium">Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full rounded-lg border p-3"
              >
                {categories.map(item => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium">
                  Price (NPR) *
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full rounded-lg border p-3"
                  placeholder="25000"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">
                  Discount Price (NPR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountPrice}
                  onChange={e => setDiscountPrice(e.target.value)}
                  className="w-full rounded-lg border p-3"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Description (English)
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full rounded-lg border p-3"
                rows={3}
                placeholder="Describe this furniture..."
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Description (Nepali)
              </label>
              <textarea
                value={descriptionNe}
                onChange={e => setDescriptionNe(e.target.value)}
                className="w-full rounded-lg border p-3"
                rows={3}
                placeholder="फर्निचरको विवरण..."
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium">Dimensions</label>
                <input
                  value={dimensions}
                  onChange={e => setDimensions(e.target.value)}
                  className="w-full rounded-lg border p-3"
                  placeholder="Example: 6 x 3 feet"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">
                  Wood / Material Type
                </label>
                <input
                  value={material}
                  onChange={e => setMaterial(e.target.value)}
                  className="w-full rounded-lg border p-3"
                  placeholder="Example: Teak wood"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block font-medium">
                {editingId ? "Add More Images (Maximum 5 total)" : "Product Images (Maximum 5)"}
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={e =>
                  setImages(Array.from(e.target.files || []).slice(0, 5))
                }
                className="w-full rounded-lg border p-3"
              />
              {images.length > 0 && (
                <p className="mt-2 text-sm text-green-700">
                  {images.length} new image(s) selected
                </p>
              )}
              {editingId && (
                <p className="mt-1 text-sm text-gray-500">
                  Existing images will be kept. This adds new images.
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium">
                  Availability
                </label>
                <select
                  value={availability}
                  onChange={e => setAvailability(e.target.value)}
                  className="w-full rounded-lg border p-3"
                >
                  <option value="available">Available</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="made_to_order">Made to Order</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-8">
                <input
                  id="published"
                  type="checkbox"
                  checked={isPublished}
                  onChange={e => setIsPublished(e.target.checked)}
                  className="h-5 w-5"
                />
                <label htmlFor="published">
                  Publish this product
                </label>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-red-700">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-lg bg-green-50 p-3 text-green-700">
                {success}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#593b25] p-4 font-semibold text-white hover:bg-[#765033] disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Add Furniture"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-400 px-5 py-3 font-semibold hover:bg-gray-100"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-5 text-xl font-bold">
            Your Furniture Products
          </h2>

          {products.length === 0 ? (
            <p className="text-gray-500">No products found yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="p-3">Product</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Availability</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b">
                      <td className="p-3 font-medium">
                        {product.name}
                      </td>
                      <td className="p-3">{product.category}</td>
                      <td className="p-3">Rs. {product.price}</td>
                      <td className="p-3">{product.availability}</td>
                      <td className="p-3">
                        {product.is_published ? "Published" : "Draft"}
                      </td>

                      <td className="min-w-[230px] p-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEditing(product)}
                            disabled={workingId !== null || saving}
                            className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => togglePublish(product)}
                            disabled={workingId !== null || saving}
                            className="rounded bg-amber-600 px-3 py-2 text-sm text-white hover:bg-amber-700 disabled:opacity-50"
                          >
                            {workingId === product.id
                              ? "Working..."
                              : product.is_published
                                ? "Unpublish"
                                : "Publish"}
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteProduct(product)}
                            disabled={workingId !== null || saving}
                            className="rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
