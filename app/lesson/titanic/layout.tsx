"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileUp, ImageUp, Menu } from "lucide-react";

import { callAndrewMyself } from "@/lib/call-andrew-myself";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const PASSENGERS_PATH = "/lesson/titanic/passengers";

const CAPTAIN_SMITH_PATH = "/lesson/titanic/captain-smith";

const topMenus = [
  { label: "승객 목록", href: PASSENGERS_PATH },
  { label: "스미스 선장과 대화", href: CAPTAIN_SMITH_PATH },
];

const lessonMenus = [
  {
    label: "파일 업로드",
    href: "/lesson/titanic/data-collection",
    icon: FileUp,
  },
  {
    label: "이미지 업로드",
    href: "/lesson/titanic/image-upload",
    icon: ImageUp,
  },
];

export default function TitanicLessonLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (pathname === PASSENGERS_PATH) {
      callAndrewMyself();
    }
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-card/70">
        <div className="mx-auto flex max-w-screen-xl items-center gap-3 overflow-x-auto px-4 py-3 text-[11px] font-semibold tracking-wide text-muted-foreground md:px-6">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="사이드바 열기"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-4 w-4" aria-hidden />
          </Button>
          {topMenus.map((menu) => (
            <Link
              key={menu.label}
              href={menu.href}
              className="whitespace-nowrap"
              onClick={() => {
                if (pathname === menu.href) {
                  callAndrewMyself();
                }
              }}
            >
              {menu.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-screen-xl gap-8 px-4 py-8 md:px-6">
        <aside className="hidden w-56 shrink-0 border-r border-border pr-5 md:block">
          <p className="mb-4 text-xs font-bold tracking-[0.2em] text-muted-foreground">
            LESSON
          </p>
          <nav className="space-y-1" aria-label="타이타닉 서브 메뉴">
            {lessonMenus.map((menu) => {
              const Icon = menu.icon;
              return (
                <Link
                  key={menu.label}
                  href={menu.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <span>{menu.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0 flex-1">{children}</section>
      </div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0">
          <SheetHeader className="border-b border-border">
            <SheetTitle>LESSON</SheetTitle>
          </SheetHeader>
          <nav className="space-y-1 p-3" aria-label="타이타닉 서브 메뉴(모바일)">
            {lessonMenus.map((menu) => {
              const Icon = menu.icon;
              return (
                <Link
                  key={menu.label}
                  href={menu.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <span>{menu.label}</span>
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
