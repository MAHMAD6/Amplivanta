import { SuperInfoNote } from "@/components/admin/primitives";
import { ContentEditor } from "@/components/admin/content-editor";
import { ContentList } from "@/components/admin/content-list";
import { contentTypeMeta, type ContentType } from "@/lib/admin/content";
import { isStorageConfigured } from "@/lib/storage";
import { loadContentItem, loadContentItems, loadConversionTargets, loadMediaAssets } from "./loaders";

/**
 * One screen serves every content type: the list, and the editor when `new` or
 * `edit` is present. Type-specific behaviour lives in the editor, not here.
 */
export async function ContentScreen({
  contentType,
  searchParams,
  note,
}: {
  contentType: ContentType;
  searchParams: { new?: string; edit?: string };
  note: string;
}) {
  const meta = contentTypeMeta(contentType)!;
  const editing = Boolean(searchParams.new) || Boolean(searchParams.edit);

  if (editing) {
    const [item, media, targets] = await Promise.all([
      searchParams.edit ? loadContentItem(searchParams.edit) : Promise.resolve(null),
      loadMediaAssets(200),
      loadConversionTargets(),
    ]);
    return (
      <div className="space-y-6">
        <ContentEditor
          item={item && item.contentType === contentType ? item : null}
          contentType={contentType}
          media={media.rows.map((m) => ({ id: m.id, fileName: m.fileName, url: m.url, mimeType: m.mimeType }))}
          forms={targets.forms}
          pages={targets.pages}
          storageReady={isStorageConfigured()}
        />
        <SuperInfoNote title={`About the ${meta.label} editor`}>{note}</SuperInfoNote>
      </div>
    );
  }

  const { rows, connected } = await loadContentItems(contentType);
  return (
    <div className="space-y-6">
      <ContentList rows={rows} contentType={contentType} connected={connected} />
      <SuperInfoNote title={`About ${meta.plural}`}>{note}</SuperInfoNote>
    </div>
  );
}
