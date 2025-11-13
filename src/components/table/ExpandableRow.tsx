"use client";

import { ReactNode, useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Product } from "@/type/product";

export default function ExpandableRowClient({
  product,
  children,
}: {
  product: Product;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <TableRow
        onClick={() => setExpanded((prev) => !prev)}
        className="cursor-pointer hover:bg-muted/50 transition-colors"
      >
        <TableCell className="font-medium">{product.name}</TableCell>
        <TableCell className="font-mono text-sm text-muted-foreground">
          {product.slug}
        </TableCell>
        <TableCell className="truncate">{product.description}</TableCell>
        <TableCell>Rp {product.price.toLocaleString("id-ID")}</TableCell>
        <TableCell className="text-right">
          <Button size="sm" variant="outline">
            {expanded ? "Hide" : "Details"}
          </Button>
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow className="bg-muted/30">
          <TableCell colSpan={5}>{children}</TableCell>
        </TableRow>
      )}
    </>
  );
}
