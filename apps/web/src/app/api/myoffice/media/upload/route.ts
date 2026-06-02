import { NextResponse } from "next/server";
import { uploadProjectMedia } from "@/lib/admin/media";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  const projectSlug = String(form.get("projectSlug") ?? "").trim().toLowerCase();
  const kind = String(form.get("kind") ?? "image") as "image" | "video";

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
  }
  if (!projectSlug || !/^[a-z0-9-]+$/.test(projectSlug)) {
    return NextResponse.json(
      { error: "Save the project slug first, then upload media." },
      { status: 400 },
    );
  }
  if (kind !== "image" && kind !== "video") {
    return NextResponse.json({ error: "Invalid media kind." }, { status: 400 });
  }

  const result = await uploadProjectMedia(file, projectSlug, kind);
  if (!result) {
    return NextResponse.json(
      {
        error:
          kind === "image"
            ? "Upload failed. Use JPG, PNG, WebP, or GIF under 12MB. Run migration 0003 for the storage bucket."
            : "Upload failed. Use MP4 or WebM under 50MB.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: result.url, path: result.path });
}
