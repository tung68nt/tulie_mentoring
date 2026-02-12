import { cn } from "@/lib/utils";

/* ─── Table Container ───────────────────────────────── */
interface TableProps {
    children: React.ReactNode;
    className?: string;
}

export function Table({ children, className }: TableProps) {
    return (
        <div className={cn("border border-[#eaeaea] rounded-lg overflow-hidden", className)}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">{children}</table>
            </div>
        </div>
    );
}

/* ─── Table Header ──────────────────────────────────── */
export function TableHeader({ children, className }: TableProps) {
    return (
        <thead className={cn("bg-[#fafafa] border-b border-[#eaeaea]", className)}>
            {children}
        </thead>
    );
}

/* ─── Table Body ────────────────────────────────────── */
export function TableBody({ children, className }: TableProps) {
    return <tbody className={cn("divide-y divide-[#f5f5f5]", className)}>{children}</tbody>;
}

/* ─── Table Row ─────────────────────────────────────── */
export function TableRow({ children, className }: TableProps) {
    return (
        <tr className={cn("hover:bg-[#fafafa] transition-colors", className)}>
            {children}
        </tr>
    );
}

/* ─── Table Head Cell ───────────────────────────────── */
interface TableCellProps {
    children: React.ReactNode;
    className?: string;
}

export function TableHead({ children, className }: TableCellProps) {
    return (
        <th className={cn("text-left px-4 py-3 text-xs font-medium text-[#666] whitespace-nowrap", className)}>
            {children}
        </th>
    );
}

/* ─── Table Cell ────────────────────────────────────── */
export function TableCell({ children, className }: TableCellProps) {
    return (
        <td className={cn("px-4 py-3 text-sm text-[#333] whitespace-nowrap", className)}>
            {children}
        </td>
    );
}
