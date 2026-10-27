"use client";

import Link from "next/link";
import { onSheetLink } from "@/lib/nav";
import { sheetPath, type SheetId } from "@/lib/sheets";

type Props = Omit<React.ComponentProps<"a">, "href"> & { sheet: SheetId };

/** A link to a sheet. A plain click turns the sheet in place; any modified click is an ordinary link. */
export default function SheetLink({ sheet, onClick, ...rest }: Props) {
  const turn = onSheetLink(sheet);
  return (
    <Link
      href={sheetPath(sheet)}
      prefetch={false}
      scroll={false}
      onClick={(e) => {
        onClick?.(e);
        turn(e);
      }}
      {...rest}
    />
  );
}
