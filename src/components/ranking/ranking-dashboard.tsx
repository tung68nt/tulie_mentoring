"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Percent, Target, Calendar, User, Search, Filter } from "lucide-react";
import { getMenteeRankings } from "@/lib/actions/ranking";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MenteeRankingProps {
    role: string;
    userId: string;
}

export function RankingDashboard({ role, userId }: MenteeRankingProps) {
    const [rankings, setRankings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<"totalScore" | "attendance" | "goals" | "evals">("totalScore");

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                // Determine filter based on role
                const filters: any = {};
                if (role === "mentor") filters.mentorId = userId;
                if (role === "facilitator") filters.facilitatorId = userId;

                const data = await getMenteeRankings(filters);
                setRankings(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [role, userId]);

    const filteredRankings = rankings.filter(r => {
        const name = `${r.mentee.firstName} ${r.mentee.lastName}`.toLowerCase();
        return name.includes(searchTerm.toLowerCase());
    });

    const sortedRankings = [...filteredRankings].sort((a, b) => {
        if (sortBy === "totalScore") return b.totalScore - a.totalScore;
        const valA = (a.metrics as any)?.[sortBy] || 0;
        const valB = (b.metrics as any)?.[sortBy] || 0;
        return valB - valA;
    });

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
        if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
        return <span className="text-muted-foreground font-mono text-[13px]">{rank}</span>;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Bảng xếp hạng Mentee</h2>
                    <p className="text-muted-foreground">Theo dõi và so sánh tiến độ dựa trên các chỉ số hoạt động.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                        <SelectTrigger className="w-[180px] rounded-lg h-10 border-border bg-background">
                            <Filter className="w-4 h-4 mr-2 opacity-50" />
                            <SelectValue placeholder="Sắp xếp theo" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border">
                            <SelectItem value="totalScore">Tổng điểm</SelectItem>
                            <SelectItem value="attendance">Chuyên cần</SelectItem>
                            <SelectItem value="goals">Mục tiêu</SelectItem>
                            <SelectItem value="evals">Bình chọn/Đánh giá</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="relative w-full md:w-[250px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm mentee..."
                            className="bg-background pl-9 h-10 rounded-lg outline-none border-border"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-background to-muted/30 border-none shadow-sm rounded-xl overflow-hidden ring-1 ring-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Tổng số Mentee</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{rankings.length}</div>
                        <p className="text-[12px] text-muted-foreground mt-1">Đã được xếp hạng trong kỳ</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-background to-muted/30 border-none shadow-sm rounded-xl overflow-hidden ring-1 ring-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Điểm TB Hệ thống</CardTitle>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(rankings.reduce((acc, r) => acc + r.totalScore, 0) / (rankings.length || 1)).toFixed(1)}/100
                        </div>
                        <p className="text-[12px] text-muted-foreground mt-1">Dựa trên kết quả hiện tại</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-xl border-none ring-1 ring-border shadow-sm overflow-hidden bg-background">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[80px] text-center font-semibold">Thứ hạng</TableHead>
                            <TableHead className="font-semibold">Mentee</TableHead>
                            <TableHead className="text-center font-semibold">Chuyên cần</TableHead>
                            <TableHead className="text-center font-semibold">Mục tiêu</TableHead>
                            <TableHead className="text-center font-semibold">Bình chọn</TableHead>
                            <TableHead className="text-right font-semibold">Tổng điểm</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={6} className="h-12 animate-pulse bg-muted/10" />
                                </TableRow>
                            ))
                        ) : sortedRankings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    Không tìm thấy dữ liệu xếp hạng.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedRankings.map((row) => (
                                <TableRow key={row.id} className="group hover:bg-muted/20 transition-colors">
                                    <TableCell className="text-center">
                                        <div className="flex justify-center">
                                            {getRankIcon(row.rank)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8 border bg-muted/40 ring-1 ring-border">
                                                <AvatarImage src={row.mentee.image || undefined} />
                                                <AvatarFallback className="text-[11px] font-bold">
                                                    {(row.mentee.firstName?.[0] || "") + (row.mentee.lastName?.[0] || "")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-[14px] leading-tight group-hover:text-primary transition-colors">
                                                    {row.mentee.firstName} {row.mentee.lastName}
                                                </span>
                                                <span className="text-[12px] text-muted-foreground leading-tight">{row.mentee.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[13px] font-medium">{(row.metrics as any).attendance}%</span>
                                            <div className="w-16 h-1 bg-muted rounded-full overflow-hidden shrink-0">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full"
                                                    style={{ width: `${(row.metrics as any).attendance}%` }}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[13px] font-medium">{(row.metrics as any).goals}%</span>
                                            <div className="w-16 h-1 bg-muted rounded-full overflow-hidden shrink-0">
                                                <div
                                                    className="h-full bg-green-500 rounded-full"
                                                    style={{ width: `${(row.metrics as any).goals}%` }}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[13px] font-medium">{(row.metrics as any).evals}%</span>
                                            <div className="w-16 h-1 bg-muted rounded-full overflow-hidden shrink-0">
                                                <div
                                                    className="h-full bg-orange-500 rounded-full"
                                                    style={{ width: `${(row.metrics as any).evals}%` }}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold rounded-lg px-2.5 py-0.5">
                                            {row.totalScore.toFixed(1)}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
