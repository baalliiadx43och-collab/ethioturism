"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Category } from "@/store/slices/destinationApiSlice";

interface FormValues {
  name: string;
  location: string;
  description: string;
  videoUrl: string;
  basePrice: number;
  dailyQuota: number;
  transportationOptions: { value: string }[];
  wildlife: { value: string }[];
  festivalType: string;
  festivalDates: { date: string; availableQuota: number; eventName: string }[];
}

interface Props {
  category: Category;
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
  defaultValues?: Partial<FormValues>;
}

const STEPS = ["Basic Info", "Media Upload", "Quota & Pricing"];

export default function DestinationForm({ category, onSubmit, isLoading, defaultValues }: Props) {
  const [step, setStep] = useState(0);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    trigger,
  } = useForm<FormValues>({
    defaultValues: {
      name: defaultValues?.name ?? "",
      location: defaultValues?.location ?? "",
      description: defaultValues?.description ?? "",
      videoUrl: defaultValues?.videoUrl ?? "",
      basePrice: defaultValues?.basePrice ?? 0,
      dailyQuota: defaultValues?.dailyQuota ?? 50,
      transportationOptions: defaultValues?.transportationOptions?.map(v => ({ value: v })) ?? [{ value: "" }],
      wildlife: defaultValues?.wildlife?.map(v => ({ value: v })) ?? [{ value: "" }],
      festivalType: defaultValues?.festivalType ?? "",
      festivalDates: defaultValues?.festivalDates ?? [],
    },
  });

  const { fields: transportFields, append: appendTransport, remove: removeTransport } =
    useFieldArray({ control, name: "transportationOptions" });

  const { fields: wildlifeFields, append: appendWildlife, remove: removeWildlife } =
    useFieldArray({ control, name: "wildlife" });

  const { fields: festivalDateFields, append: appendFestivalDate, remove: removeFestivalDate } =
    useFieldArray({ control, name: "festivalDates" });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setImageFiles(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (idx: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const nextStep = async () => {
    const stepFields: (keyof FormValues)[][] = [
      ["name", "location", "description"],
      [],
      ["basePrice", "dailyQuota"],
    ];
    const valid = await trigger(stepFields[step]);
    if (valid) setStep(s => s + 1);
  };

  const handleFormSubmit = async (values: FormValues) => {
    const fd = new FormData();
    fd.append("name", values.name);
    fd.append("location", values.location);
    fd.append("description", values.description);
    fd.append("videoUrl", values.videoUrl);
    fd.append("basePrice", String(values.basePrice));
    fd.append("dailyQuota", String(values.dailyQuota));

    const transport = values.transportationOptions.map(t => t.value).filter(Boolean);
    fd.append("transportationOptions", JSON.stringify(transport));

    if (category === "parks") {
      const wl = values.wildlife.map(w => w.value).filter(Boolean);
      fd.append("wildlife", JSON.stringify(wl));
    }
    if (category === "festivals") {
      fd.append("festivalType", values.festivalType);
      fd.append("festivalDates", JSON.stringify(values.festivalDates));
    }

    imageFiles.forEach(f => fd.append("images", f));
    await onSubmit(fd);
  };

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";
  const errorCls = "text-xs text-red-500 mt-1";

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              i < step ? "bg-emerald-600 text-white" : i === step ? "bg-emerald-600 text-white ring-4 ring-emerald-100" : "bg-gray-200 text-gray-500"
            }`}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-sm font-medium ${i === step ? "text-emerald-700" : "text-gray-400"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 w-8 ${i < step ? "bg-emerald-600" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {/* ── Step 1: Basic Info ── */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input {...register("name", { required: "Name is required" })} className={inputCls} placeholder="e.g. Lalibela Rock Churches" />
              {errors.name && <p className={errorCls}>{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input {...register("location", { required: "Location is required" })} className={inputCls} placeholder="e.g. Lalibela, Amhara Region" />
              {errors.location && <p className={errorCls}>{errors.location.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea {...register("description", { required: "Description is required" })} rows={4} className={inputCls} placeholder="Describe this destination..." />
              {errors.description && <p className={errorCls}>{errors.description.message}</p>}
            </div>

            {/* Transportation options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transportation Options from Addis Ababa</label>
              <div className="space-y-2">
                {transportFields.map((field, idx) => (
                  <div key={field.id} className="flex gap-2">
                    <input {...register(`transportationOptions.${idx}.value`)} className={inputCls} placeholder="e.g. Ethiopian Airlines flight" />
                    <button type="button" onClick={() => removeTransport(idx)} className="px-2 text-red-400 hover:text-red-600">✕</button>
                  </div>
                ))}
                <button type="button" onClick={() => appendTransport({ value: "" })} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  + Add option
                </button>
              </div>
            </div>

            {/* Wildlife for parks */}
            {category === "parks" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wildlife</label>
                <div className="space-y-2">
                  {wildlifeFields.map((field, idx) => (
                    <div key={field.id} className="flex gap-2">
                      <input {...register(`wildlife.${idx}.value`)} className={inputCls} placeholder="e.g. Ethiopian Wolf" />
                      <button type="button" onClick={() => removeWildlife(idx)} className="px-2 text-red-400 hover:text-red-600">✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => appendWildlife({ value: "" })} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                    + Add animal
                  </button>
                </div>
              </div>
            )}

            {/* Festival type */}
            {category === "festivals" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Festival Type</label>
                <input {...register("festivalType")} className={inputCls} placeholder="e.g. Timkat, Meskel, Irreecha, Ashenda" />
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Media Upload ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-400 transition-colors">
                <span className="text-2xl mb-1">📷</span>
                <span className="text-sm text-gray-500">Click to upload images (JPG, PNG, WebP)</span>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative group">
                      <img src={src} alt="" className="w-full h-20 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (YouTube / Vimeo / Cloudinary)</label>
              <input
                {...register("videoUrl")}
                className={inputCls}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-gray-400 mt-1">Paste a YouTube, Vimeo, or Cloudinary video link. Large files are not stored directly.</p>
            </div>
          </div>
        )}

        {/* ── Step 3: Quota & Pricing ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (ETB) *</label>
                <input
                  type="number"
                  {...register("basePrice", { required: "Price is required", min: { value: 0, message: "Price cannot be negative" } })}
                  className={inputCls}
                  placeholder="500"
                />
                {errors.basePrice && <p className={errorCls}>{errors.basePrice.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Daily Quota *</label>
                <input
                  type="number"
                  {...register("dailyQuota", {
                    required: "Quota is required",
                    min: { value: 1, message: "Quota must be at least 1" },
                    validate: v => Number.isInteger(Number(v)) || "Quota must be a whole number"
                  })}
                  className={inputCls}
                  placeholder="100"
                />
                {errors.dailyQuota && <p className={errorCls}>{errors.dailyQuota.message}</p>}
              </div>
            </div>

            {/* Festival-specific date management */}
            {category === "festivals" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Festival Dates & Quotas</label>
                <div className="space-y-3">
                  {festivalDateFields.map((field, idx) => (
                    <div key={field.id} className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Date</label>
                        <input type="date" {...register(`festivalDates.${idx}.date`)} className={inputCls} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Quota</label>
                        <input type="number" {...register(`festivalDates.${idx}.availableQuota`, { min: 0 })} className={inputCls} placeholder="200" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Event Name</label>
                        <div className="flex gap-1">
                          <input {...register(`festivalDates.${idx}.eventName`)} className={inputCls} placeholder="Day 1" />
                          <button type="button" onClick={() => removeFestivalDate(idx)} className="px-2 text-red-400 hover:text-red-600 text-sm">✕</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => appendFestivalDate({ date: "", availableQuota: 100, eventName: "" })}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    + Add festival date
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="px-5 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-40"
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Destination"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
