"use client";

import * as React from "react";
import { Bot, BookUser, Mail, ScanFace, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getApiBase } from "@/lib/api-base";
import ContactsUploadDialog from "@/components/contacts-upload-dialog";
import EmailSendForm from "@/components/email-send-form";

export type Contact = { name: string; email: string };

const DEFAULT_CONTACTS: Contact[] = [{ name: "나", email: "bsgum@naver.com" }];

type View = "email" | "contacts" | "telegram" | "orchestrator" | "detection";

export default function AutomodePage() {
  const [view, setView] = React.useState<View>("email");
  const [contacts, setContacts] = React.useState<Contact[]>(DEFAULT_CONTACTS);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [telegramText, setTelegramText] = React.useState("");
  const [telegramSending, setTelegramSending] = React.useState(false);
  const [orchText, setOrchText] = React.useState("");
  const [orchSending, setOrchSending] = React.useState(false);
  const [orchResult, setOrchResult] = React.useState<{
    tool: string;
    message: string;
  } | null>(null);
  const [detecting, setDetecting] = React.useState(false);
  const [detectionResult, setDetectionResult] = React.useState<{
    predicted_name: string;
    confidence: number;
  } | null>(null);
  const [detectionPreviewUrl, setDetectionPreviewUrl] = React.useState<
    string | null
  >(null);
  const detectionInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    return () => {
      if (detectionPreviewUrl) URL.revokeObjectURL(detectionPreviewUrl);
    };
  }, [detectionPreviewUrl]);

  const runDetection = React.useCallback(async (file: File) => {
    setDetecting(true);
    setDetectionResult(null);
    setDetectionPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${getApiBase()}/api/vision2/yolo/predict`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("인식 실패");
      const json = await res.json();
      setDetectionResult(json);
    } catch {
      alert("얼굴 인식에 실패했습니다.");
    } finally {
      setDetecting(false);
    }
  }, []);

  const fetchContacts = React.useCallback(async () => {
    try {
      const res = await fetch(`${getApiBase()}/api/automode/juso/contacts`);
      if (!res.ok) return;
      const data: Contact[] = await res.json();
      setContacts(data.length > 0 ? data : DEFAULT_CONTACTS);
    } catch {
      // 서버 미응답 시 기본값 유지
    }
  }, []);

  React.useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <aside className="w-44 shrink-0 border-r border-border bg-card px-3 py-6">
        <nav className="grid gap-1">
          <button
            onClick={() => setView("email")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              view === "email"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Mail className="h-4 w-4" />
            이메일 발송
          </button>
          <button
            onClick={() => setView("contacts")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              view === "contacts"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <BookUser className="h-4 w-4" />
            주소록
          </button>
          <button
            onClick={() => setView("telegram")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              view === "telegram"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Send className="h-4 w-4" />
            텔레그램
          </button>
          <button
            onClick={() => setView("orchestrator")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              view === "orchestrator"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Bot className="h-4 w-4" />
            오케스트레이터
          </button>
          <button
            onClick={() => setView("detection")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              view === "detection"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <ScanFace className="h-4 w-4" />
            객체 탐지
          </button>
        </nav>
      </aside>

      <main className="flex-1 px-6 py-8">
        {view === "email" && (
          <div className="mx-auto max-w-lg">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-primary">
                <Mail className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  AI 이메일 발송
                </h1>
                <p className="text-sm text-muted-foreground">
                  EXAONE 3.5가 이메일을 작성해 Gmail로 발송합니다.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <EmailSendForm contacts={contacts} />
            </div>
          </div>
        )}

        {view === "contacts" && (
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-xl font-bold text-foreground">주소록</h1>
              <Button onClick={() => setDialogOpen(true)}>등록</Button>
            </div>

            <div className="rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>이메일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center text-muted-foreground"
                      >
                        연락처가 없습니다. CSV 파일을 업로드해 추가하세요.
                      </TableCell>
                    </TableRow>
                  ) : (
                    contacts.map((c) => (
                      <TableRow key={`${c.name}-${c.email}`}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>{c.email}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <ContactsUploadDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              onUpload={fetchContacts}
            />
          </div>
        )}

        {view === "telegram" && (
          <div className="mx-auto max-w-lg">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-primary">
                <Send className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">텔레그램</h1>
                <p className="text-sm text-muted-foreground">
                  메시지를 입력하면 스마트폰 텔레그램으로 전송됩니다.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!telegramText.trim()) return;
                  setTelegramSending(true);
                  try {
                    const res = await fetch(
                      `${getApiBase()}/api/automode/telegram/send`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ text: telegramText }),
                      },
                    );
                    if (!res.ok) throw new Error("전송 실패");
                    setTelegramText("");
                  } catch {
                    alert("텔레그램 전송에 실패했습니다.");
                  } finally {
                    setTelegramSending(false);
                  }
                }}
                className="flex flex-col gap-3"
              >
                <textarea
                  value={telegramText}
                  onChange={(e) => setTelegramText(e.target.value)}
                  placeholder="전송할 메시지를 입력하세요..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button type="submit" disabled={telegramSending || !telegramText.trim()}>
                  {telegramSending ? "전송 중..." : "전송"}
                </Button>
              </form>
            </div>
          </div>
        )}
        {view === "orchestrator" && (
          <div className="mx-auto max-w-lg">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-primary">
                <Bot className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  AI 오케스트레이터
                </h1>
                <p className="text-sm text-muted-foreground">
                  EXAONE 7.8B가 명령을 분석해 적절한 작업을 수행합니다.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!orchText.trim()) return;
                  setOrchSending(true);
                  setOrchResult(null);
                  try {
                    const res = await fetch(
                      `${getApiBase()}/api/automode/orchestrate/`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ message: orchText }),
                      },
                    );
                    if (!res.ok) throw new Error("실행 실패");
                    const json = await res.json();
                    setOrchResult(json);
                    setOrchText("");
                  } catch {
                    alert("오케스트레이터 실행에 실패했습니다.");
                  } finally {
                    setOrchSending(false);
                  }
                }}
                className="flex flex-col gap-3"
              >
                <textarea
                  value={orchText}
                  onChange={(e) => setOrchText(e.target.value)}
                  placeholder={`예: "울누나한테 안부 메일 보내줘"\n또는: "텔레그램으로 서버 점검 중이라고 알려줘"`}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button
                  type="submit"
                  disabled={orchSending || !orchText.trim()}
                >
                  {orchSending ? "AI 처리 중..." : "명령 실행"}
                </Button>
              </form>
              {orchResult && (
                <div className="mt-4 rounded-lg bg-muted px-4 py-3 text-sm">
                  <p className="mb-1 font-medium text-muted-foreground">
                    [{orchResult.tool}]
                  </p>
                  <p className="text-foreground">{orchResult.message}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === "detection" && (
          <div className="mx-auto max-w-lg">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-primary">
                <ScanFace className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  객체 탐지
                </h1>
                <p className="text-sm text-muted-foreground">
                  얼굴 사진을 올리면 YOLO 모델이 이름을 맞춰줍니다.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <input
                ref={detectionInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) runDetection(file);
                  e.target.value = "";
                }}
              />
              <Button
                onClick={() => detectionInputRef.current?.click()}
                disabled={detecting}
                className="w-full"
              >
                {detecting ? "인식 중..." : "얼굴 사진 업로드"}
              </Button>
              {detectionPreviewUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- blob: URL은 next/image 로더가 지원하지 않음
                <img
                  src={detectionPreviewUrl}
                  alt="업로드한 얼굴 사진"
                  className="mt-4 max-h-80 w-full rounded-lg object-contain"
                />
              )}
              {detectionResult && (
                <div className="mt-4 rounded-lg bg-muted px-4 py-3 text-sm">
                  <p className="mb-1 font-medium text-muted-foreground">
                    예측 결과
                  </p>
                  <p className="text-foreground">
                    {detectionResult.predicted_name} (
                    {(detectionResult.confidence * 100).toFixed(1)}%)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
