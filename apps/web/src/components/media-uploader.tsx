"use client";
import { useState } from "react";
export function MediaUploader() {
  const [id, setId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  async function attach(fileId: string) {
    const res = await fetch("/api/media/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId, documentId: id }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setDone(true);
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setDone(false);
    setBusy(true);
    try {
      if (uploaded) {
        await attach(uploaded);
        return;
      }
      if (
        !file ||
        !["video/mp4", "video/webm"].includes(file.type) ||
        file.size > 500 * 1024 * 1024
      )
        throw new Error("Choose an MP4 or WebM video under 500 MB.");
      const response = await fetch("/api/media/upload-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: id }),
      });
      const auth = await response.json();
      if (!response.ok) throw new Error(auth.error);
      const form = new FormData();
      form.set("file", file);
      form.set("fileName", file.name);
      for (const k of ["publicKey", "signature", "token", "expire", "folder"])
        form.set(k, String(auth[k]));
      const fileId = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable)
            setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.timeout = 600000;
        xhr.onerror = () =>
          reject(new Error("Upload interrupted. Please retry."));
        xhr.ontimeout = () =>
          reject(new Error("Upload timed out. Please retry."));
        xhr.onload = () => {
          try {
            const result = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300 && result.fileId)
              resolve(result.fileId);
            else reject(new Error("ImageKit rejected the upload."));
          } catch {
            reject(new Error("Invalid upload response."));
          }
        };
        xhr.send(form);
      });
      setUploaded(fileId);
      await attach(fileId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="media-uploader">
      <h2>Direct video upload.</h2>
      <p>
        Uploads go directly to ImageKit, then attach to the project’s draft in
        Strapi. Publishing remains a separate CMS action.
      </p>
      <form onSubmit={submit}>
        <label>
          Strapi project document ID
          <input
            required
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              setUploaded(null);
            }}
            disabled={busy || !!uploaded}
            pattern="\w{10,40}"
            placeholder="Document ID from Strapi"
          />
        </label>
        <label>
          Project video (MP4 / WebM, max. 500 MB)
          <input
            type="file"
            accept="video/mp4,video/webm"
            required={!uploaded}
            disabled={busy || !!uploaded}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        {busy && (
          <progress max={100} value={progress} aria-label="Upload progress">
            {progress}%
          </progress>
        )}
        <button className="button" disabled={busy || done}>
          {busy
            ? `Working… ${progress}%`
            : uploaded
              ? "Retry attachment"
              : "Upload & attach to draft"}
        </button>
        {uploaded && !done && (
          <button
            type="button"
            onClick={() => {
              setUploaded(null);
              setProgress(0);
            }}
            className="text-link"
          >
            Start another upload
          </button>
        )}
        {error && <p role="alert">{error}</p>}
        {done && (
          <p role="status">
            Video attached to the project draft. Review and publish in Strapi.
          </p>
        )}
      </form>
    </section>
  );
}
