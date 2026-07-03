"use client";

import * as React from "react";
import { ImageUp, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const ACCEPTED_FILE_TYPES = "image/*,.jpg,.jpeg,.png,.gif,.webp";

type UploadResult = {
  ok?: boolean;
  error?: string;
  fileName?: string;
  contentType?: string;
  size?: number;
};

function isAcceptedImage(file: File): boolean {
  return file.type.startsWith("image/");
}

async function postImage(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.set("file", file);

  const res = await fetch("/api/backend/api/vision2/vision/imageupload", {
    method: "POST",
    body: formData,
  });
  const raw = await res.text();
  type DetailedResult = UploadResult & {
    detail?: string | { msg: string }[];
  };
  let data: DetailedResult;
  try {
    data = raw ? (JSON.parse(raw) as DetailedResult) : {};
  } catch {
    throw new Error(raw.trim() || `업로드 실패 (${res.status})`);
  }
  if (!res.ok) {
    const detail =
      typeof data.detail === "string"
        ? data.detail
        : Array.isArray(data.detail)
          ? data.detail.map((d) => d.msg).join(", ")
          : undefined;
    throw new Error(data.error ?? detail ?? `업로드 실패 (${res.status})`);
  }
  if (data.ok === false || data.error) {
    throw new Error(data.error ?? "업로드 실패");
  }
  return data;
}

export default function TitanicImageUploadPage() {
  const [uploading, setUploading] = React.useState(false);
  const [lastUpload, setLastUpload] = React.useState<UploadResult | null>(null);
  const panelInputRef = React.useRef<HTMLInputElement>(null);
  const buttonInputRef = React.useRef<HTMLInputElement>(null);

  const runUpload = React.useCallback(async (file: File | undefined) => {
    if (!file) return;
    if (!isAcceptedImage(file)) {
      toast.error("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    setUploading(true);
    try {
      const data = await postImage(file);
      setLastUpload(data);
      toast.success(`${data.fileName} 업로드 완료`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">
          LESSON
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">타이타닉</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          이미지 파일을 업로드하여 Vision 분석을 진행할 수 있습니다.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold text-foreground">방식 1 - 업로드 창</p>
          <input
            ref={panelInputRef}
            type="file"
            accept={ACCEPTED_FILE_TYPES}
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              void runUpload(f);
            }}
          />
          <div
            className="mt-3 flex min-h-44 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-border bg-card p-6 text-center"
            onClick={() => {
              if (!uploading) panelInputRef.current?.click();
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (uploading) return;
              const f = e.dataTransfer.files?.[0];
              void runUpload(f);
            }}
          >
            <div>
              <Upload
                className="mx-auto mb-3 h-8 w-8 text-muted-foreground"
                aria-hidden
              />
              <p className="text-sm font-semibold">
                이미지를 여기에 끌어다 놓거나 클릭하세요
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                예: photo.png, photo.jpg - 최대 100MB
              </p>
            </div>
          </div>
        </div>

        <div className="relative text-center">
          <span className="bg-background px-3 text-xs text-muted-foreground">또는</span>
          <div className="-mt-2 border-t border-border" />
        </div>

        <div className="text-center">
          <p className="mb-3 text-sm font-semibold text-foreground">방식 2 - 파일로 버튼</p>
          <input
            ref={buttonInputRef}
            type="file"
            accept={ACCEPTED_FILE_TYPES}
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              void runUpload(f);
            }}
          />
          <Button
            size="lg"
            className="rounded-full px-6"
            disabled={uploading}
            onClick={() => buttonInputRef.current?.click()}
          >
            <ImageUp className="mr-2 h-4 w-4" />
            {uploading ? "업로드 중..." : "이미지 선택하여 업로드"}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            버튼을 누르면 파일 찾기가 열리고, 선택 즉시 서버로 전송됩니다.
          </p>
          {lastUpload && (
            <p className="mt-2 text-xs text-foreground">
              최근 업로드: {lastUpload.fileName} ({lastUpload.contentType})
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
