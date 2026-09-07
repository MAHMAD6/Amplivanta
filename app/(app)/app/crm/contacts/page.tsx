import type { Metadata } from "next";
import { ContactsClient } from "@/components/amplivanta/contacts-client";
import { PageHeader } from "@/components/amplivanta/page-header";
import { CrmSubnav } from "@/components/amplivanta/crm-subnav";
import { ResourceDialog } from "@/components/amplivanta/crud/resource-dialog";
import { CONTACT_FIELDS } from "@/components/amplivanta/crm/crm-fields";
import { UserPlus } from "lucide-react";
import { loadContacts } from "@/lib/server/crm";

export const metadata: Metadata = { title: "Contacts" };
export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const { contacts, live } = await loadContacts();
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Contacts"
        subtitle="Manage relationships, track interactions, and close more deals."
        actions={
          <ResourceDialog
            title="New Contact"
            description="Add a contact to this workspace."
            fields={CONTACT_FIELDS}
            endpoint="/api/contacts"
            submitLabel="Create contact"
            successMessage="Contact created"
            trigger={
              <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
                <UserPlus className="h-3.5 w-3.5" /> Add Contact
              </button>
            }
          />
        }
      />
      <CrmSubnav />
      {live && (
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live · {contacts.length} contacts from database
        </div>
      )}
      <ContactsClient contacts={contacts} live={live} />
    </div>
  );
}
