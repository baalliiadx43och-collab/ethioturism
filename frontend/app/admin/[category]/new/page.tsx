"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCreateDestinationMutation, Category } from "@/store/slices/destinationApiSlice";
import DestinationForm from "@/components/admin/DestinationForm";

const LABELS: Record<string, string> = {
  historical: "Historical Site",
  parks: "National Park",
  festivals: "Cultural Festival",
};

export default function NewDestinationPage() {
  const { category } = useParams<{ category: string }>();
  const cat = category as Category;
  const router = useRouter();
  const [createDestination, { isLoading }] = useCreateDestinationMutation();

  const handleSubmit = async (data: FormData) => {
    try {
      await createDestination({ category: cat, data }).unwrap();
      router.push(`/admin/${cat}`);
    } catch (err: any) {
      alert(err?.data?.message || "Failed to create destination");
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/admin/${cat}`} className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
        <h1 className="text-2xl font-bold text-gray-900">Add {LABELS[cat]}</h1>
      </div>
      <DestinationForm category={cat} onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
