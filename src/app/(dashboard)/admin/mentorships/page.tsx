import { getMentorships } from "@/lib/actions/mentorship";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Plus, Users, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function MentorshipsPage() {
    const mentorships = await getMentorships();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Mentorship</h1>
                    <p className="text-gray-500 mt-1">Danh sách các cặp mentor và mentee trong chương trình</p>
                </div>
                <Button asChild>
                    <Link href="/admin/mentorships/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Tạo Mentorship mới
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mentorships.length === 0 ? (
                    <Card className="lg:col-span-2 flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                            <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Chưa có mentorship nào</h3>
                        <p className="text-gray-500 max-w-xs mt-1">
                            Hãy bắt đầu bằng cách gán mentor cho các mentees.
                        </p>
                        <Button variant="outline" className="mt-6" asChild>
                            <Link href="/admin/mentorships/new">Tạo ngay</Link>
                        </Button>
                    </Card>
                ) : (
                    mentorships.map((m) => (
                        <Card key={m.id} hover padding="none" className="overflow-hidden flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex items-start justify-between mb-6">
                                    <Badge status={m.status} />
                                    <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                                        {m.programCycle.name}
                                    </span>
                                </div>

                                <div className="flex items-center gap-6">
                                    {/* Mentor */}
                                    <div className="flex flex-col items-center text-center gap-2 flex-1">
                                        <Avatar
                                            firstName={m.mentor.firstName}
                                            lastName={m.mentor.lastName}
                                            src={m.mentor.avatar}
                                            size="lg"
                                        />
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium mb-0.5">Mentor</p>
                                            <p className="text-sm font-bold text-gray-900">
                                                {m.mentor.firstName} {m.mentor.lastName}
                                            </p>
                                        </div>
                                    </div>

                                    <ArrowRight className="w-5 h-5 text-gray-300 shrink-0" />

                                    {/* Mentees */}
                                    <div className="flex flex-col items-center text-center gap-2 flex-1">
                                        <AvatarGroup
                                            users={m.mentees.map((mt) => mt.mentee)}
                                            max={3}
                                            size="md"
                                        />
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium mb-0.5">
                                                {m.mentees.length} Mentees
                                            </p>
                                            <p className="text-sm font-bold text-gray-900">
                                                {m.type === "one_on_one" ? "Cá nhân 1:1" : "Nhóm 1:n"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{formatDate(m.startDate)} - {formatDate(m.endDate)}</span>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/admin/mentorships/${m.id}`}>Chi tiết</Link>
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
