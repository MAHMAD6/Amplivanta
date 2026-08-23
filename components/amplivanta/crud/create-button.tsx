"use client";

import { Plus } from "lucide-react";
import { ResourceDialog, type Field } from "./resource-dialog";

/**
 * Standard gradient "New X" button that opens a create dialog. Thin wrapper over
 * ResourceDialog to keep module pages to a single line.
 */
export function CreateButton({
  label,
  fields,
  endpoint,
  title,
  description,
  buttonText,
  arrayFields,
}: {
  label: string;
  fields: Field[];
  endpoint: string;
  title?: string;
  description?: string;
  buttonText?: string;
  arrayFields?: string[];
}) {
  return (
    <ResourceDialog
      title={title ?? `New ${label}`}
      description={description}
      fields={fields}
      endpoint={endpoint}
      submitLabel={`Create ${label.toLowerCase()}`}
      successMessage={`${label} created`}
      arrayFields={arrayFields}
      trigger={
        <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
          <Plus className="h-3.5 w-3.5" /> {buttonText ?? `New ${label}`}
        </button>
      }
    />
  );
}
