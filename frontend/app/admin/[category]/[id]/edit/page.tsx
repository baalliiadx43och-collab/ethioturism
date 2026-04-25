"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  useGetDestinationQuery,
  useUpdateDestinationMutation,
  Category,
} from "@/store/slices/destinationApiSlice";
import DestinationForm from "@/components/admin/DestinationForm";

export default function EditDestinationPage() {
  const { category, id } = useParams<{ category: string; id: string }>();
  const cat = category as Category;
  const router = useRouter();

  const { data, isLoading } = useGetDestinationQuery({ category: cat, id });
  const [updateDestination, { isLoading: updating }] = useUpdateDestinationMutation();

  const handleSubmit = async (formData: FormData) => {
    try {
      await updateDestination({ category: cat, id, data: formData }).unwrap();
      router.push(`/admin/${cat}/${id}`);
    } catch (err: any) {
      alert(err?.data?.message || "Failed to update destination");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" /></div>;
  }

  const item = data?.item;
  if (!item) return <p className="text-gray-500">Destination not found.</p>;

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/admin/${cat}/${id}`} className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit {item.name}</h1>
      </div>
      <DestinationForm
        category={cat}
        onSubmit={handleSubmit}
        isLoading={updating}
        defaultValues={{
          name: item.name,
          location: item.location,
          description: item.description,
          videoUrl: item.videoUrl,
          basePrice: parseFloat(String(item.basePrice)),
          dailyQuota: item.dailyQuota,
          transportationOptions: item.transportationOptions,
          wildlife: item.wildlife,
          festivalType: item.festivalType,
          festivalDates: item.festivalDates?.map(fd => ({
            date: fd.date,
            availableQuota: fd.availableQuota,
            eventName: fd.eventName ?? "",
          })),
        }}
      />
    </div>
  );
}
