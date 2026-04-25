"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Category, useUploadMediaMutation } from "@/store/slices/destinationApiSlice";

interface FormValues {
  name: string;
  location: string;
  description: string;
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
  defaultValues?: {
    name?: string;
    location?: string;
    description?: string;
    basePrice?: number;
    dailyQuota?: number;
    transportationOptions?: string[];
    wildlife?: string[];
    festivalType?: string;
    festivalDates?: { date: string; availableQuota: number; eventName: string }[];
    videoUrl?: string;
  };
}

const STEPS = ["Basic Info", "Media Upload", "Quota & Pricing"];

export default function DestinationForm({ category, onSubmit, isLoading, defaultValues }: Props) {
  const [step, setStep] = useState(0);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>(defaultValues?.videoUrl ?? "");
  const [videoUploading, setVideoUploading] = useState(false);

  const [uploadMedia] = useUploadMediaMutation();

  const { register, handleSubmit, control, formState: { errors }, trigger } = useForm<FormValues, unknown, FormValues>({
    defaultValues: {
      name: defaultValues?.name ?? "",
      location: defaultValues?.location ?? "",
      description: defaultValues?.description ?? "",
      basePrice: defaultValues?.basePrice ?? undefined,
      dailyQuota: defaultValues?.dailyQuota ?? 50,
      transportationOptions: defaultValues?.transportationOptions?.map((v: string) => ({ value: v })) ?? [{ value: "" }],
      wildlife: defaultValues?.wildlife?.map((v: string) => ({ value: v })) ?? [{ value: "" }],      festivalType: defaultValues?.festivalType ?? "",
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
      reader.onload = ev => setImagePreviews(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (idx: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  // Upload video to Cloudinary immediately on selection — get URL back before form submit
  const handleVideoSelect = async (file: File) => {
    setVideoFile(file);
    setVideoUploading(true);
    try {
      const fd = new FormData();
      fd.append("files", file);
      const result = await uploadMedia(fd).unwrap();
      setUploadedVideoUrl(result.files[0]?.url ?? "");
    } catch {
      alert("Video upload failed. Please try a smaller file or check your connection.");
      setVideoFile(null);
      setUploadedVideoUrl("");
    } finally {
      setVideoUploading(false);
    }
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
    fd.append("basePrice", String(values.basePrice));
    fd.append("dailyQuota", String(values.dailyQuota));
    fd.append("transportationOptions", JSON.stringify(values.transportationOptions.map(t => t.value).filter(Boolean)));

    if (category === "parks") {
      fd.append("wildlife", JSON.stringify(values.wildlife.map(w => w.value).filter(Boolean)));
    }
    if (category === "festivals") {
      fd.append("festivalType", values.festivalType);
      fd.append("festivalDates", JSON.stringify(values.festivalDates));
    }

    imageFiles.forEach(f => fd.append("images", f));

    // Video was pre-uploaded — just send the URL string, no file in this request
    if (uploadedVideoUrl) fd.append("videoUrl", uploadedVideoUrl);

    await onSubmit(fd);
  };

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500";
  const errCls = "text-xs text-red-500 mt-1";

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              i < step ? "bg-green-600 text-white" : i === step ? "bg-green-600 text-white ring-4 ring-green-100" : "bg-gray-200 text-gray-500"
            }`}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-sm font-medium ${i === step ? "text-green-700" : "text-gray-400"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`h-0.5 w-8 ${i < step ? "bg-green-600" : "bg-gray-200"}`} />}
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
              {errors.name && <p className={errCls}>{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input {...register("location", { required: "Location is required" })} className={inputCls} placeholder="e.g. Lalibela, Amhara Region" />
              {errors.location && <p className={errCls}>{errors.location.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 font-medium mb-1">💡 Formatting Tips:</p>
                <p className="text-xs text-blue-600">
                  Use <strong>bold headings</strong> followed by descriptions. Example:<br/>
                  <code className="bg-white px-1 py-0.5 rounded text-blue-700">
                    Rock-Hewn Churches: Description here...<br/>
                    Architecture: More details...<br/>
                    Living Shrine: Additional info...
                  </code>
                </p>
              </div>
              <textarea 
                {...register("description", { required: "Description is required" })} 
                rows={12} 
                className={inputCls} 
                placeholder="Example:&#10;&#10;Rock-Hewn Churches: The churches are divided into two main clusters—northern and southeastern—separated by the 'Jordan River,' with the cross-shaped Bete Giyorgis standing in isolation.&#10;&#10;Architecture: These structures were not built with blocks but were chiseled directly into the volcanic basaltic rock, featuring complex drainage systems.&#10;&#10;Living Shrine: Unlike many historical ruins, this remains an active center of worship where ancient rituals are still practiced today." 
              />
              {errors.description && <p className={errCls}>{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transportation from Addis Ababa</label>
              <p className="text-xs text-gray-500 mb-2">Add detailed transportation options (e.g., "By Air: Ethiopian Airlines operates daily flights...")</p>
              <div className="space-y-2">
                {transportFields.map((field, idx) => (
                  <div key={field.id} className="flex gap-2">
                    <textarea 
                      {...register(`transportationOptions.${idx}.value`)} 
                      className={inputCls} 
                      rows={2}
                      placeholder="e.g., By Air (Recommended): Ethiopian Airlines operates daily direct flights from Addis Ababa. Flight takes 1 hour. Airport is 23 km from town center." 
                    />
                    <button type="button" onClick={() => removeTransport(idx)} className="px-2 text-red-400 hover:text-red-600 self-start mt-2">✕</button>
                  </div>
                ))}
                <button type="button" onClick={() => appendTransport({ value: "" })} className="text-sm text-green-600 font-medium">+ Add option</button>
              </div>
            </div>

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
                  <button type="button" onClick={() => appendWildlife({ value: "" })} className="text-sm text-green-600 font-medium">+ Add animal</button>
                </div>
              </div>
            )}

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
            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-400 transition-colors">
                <span className="text-2xl mb-1">📷</span>
                <span className="text-sm text-gray-500">Click to upload images (JPG, PNG, WebP)</span>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative group">
                      <img src={src} alt="" className="w-full h-20 object-cover rounded-lg" />
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Video */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video <span className="text-gray-400 font-normal text-xs">(optional — uploads to Cloudinary before saving)</span>
              </label>

              {videoUploading && (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-700">Uploading to Cloudinary...</p>
                    <p className="text-xs text-green-500">{videoFile?.name} · {videoFile ? (videoFile.size / (1024 * 1024)).toFixed(1) : 0} MB</p>
                  </div>
                </div>
              )}

              {!videoUploading && uploadedVideoUrl && (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-2xl">🎬</span>
                  <p className="text-sm text-green-700 font-medium flex-1 truncate">Video uploaded ✓</p>
                  <button type="button" onClick={() => { setUploadedVideoUrl(""); setVideoFile(null); }}
                    className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                </div>
              )}

              {!videoUploading && !uploadedVideoUrl && (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-400 transition-colors">
                  <span className="text-2xl mb-1">🎬</span>
                  <span className="text-sm text-gray-500">Click to upload video (MP4, MOV)</span>
                  <input type="file" accept="video/mp4,video/quicktime,video/*"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleVideoSelect(f); }}
                    className="hidden" />
                </label>
              )}
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
                  step="0.01"
                  {...register("basePrice", { 
                    required: "Price is required", 
                    min: { value: 1, message: "Price must be at least 1 ETB" },
                    valueAsNumber: true
                  })} 
                  className={inputCls} 
                  placeholder="500" 
                />
                {errors.basePrice && <p className={errCls}>{errors.basePrice.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Daily Quota *</label>
                <input type="number" {...register("dailyQuota", {
                  required: "Quota is required",
                  min: { value: 1, message: "Quota must be at least 1" },
                  valueAsNumber: true,
                  validate: v => Number.isInteger(Number(v)) || "Quota must be a whole number"
                })} className={inputCls} placeholder="100" />
                {errors.dailyQuota && <p className={errCls}>{errors.dailyQuota.message}</p>}
              </div>
            </div>

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
                  <button type="button" onClick={() => appendFestivalDate({ date: "", availableQuota: 100, eventName: "" })}
                    className="text-sm text-green-600 font-medium">+ Add festival date</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
          <button type="button" onClick={() => setStep(s => s - 1)} disabled={step === 0}
            className="px-5 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-40">
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={nextStep}
              className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
              Next
            </button>
          ) : (
            <button type="submit" disabled={isLoading || videoUploading}
              className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50">
              {videoUploading ? "Uploading video..." : isLoading ? "Saving..." : "Save Destination"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
