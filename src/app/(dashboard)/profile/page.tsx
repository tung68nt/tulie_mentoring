import { auth } from "@/lib/auth";
import { getUserProfile } from "@/lib/actions/user";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    User as UserIcon,
    Mail,
    Phone,
    Briefcase,
    GraduationCap,
    Award,
    Link as LinkIcon
} from "lucide-react";

export default async function ProfilePage() {
    const session = await auth();
    const userId = session?.user?.id;

    const user = await getUserProfile(userId!);
    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
                <p className="text-gray-500 mt-1">Thông tin tài khoản và thiết lập cá nhân của bạn</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Avatar & Quick Info */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="p-8 flex flex-col items-center text-center">
                        <Avatar
                            firstName={user.firstName}
                            lastName={user.lastName}
                            src={user.avatar}
                            size="xl"
                            className="w-32 h-32 text-4xl mb-6 shadow-xl border-4 border-white"
                        />
                        <h2 className="text-xl font-bold text-gray-900">{user.firstName} {user.lastName}</h2>
                        <p className="text-xs font-bold text-gray-400 mt-1 mb-4">{user.role}</p>
                        <Badge status={user.isActive ? "active" : "offline"} className="mb-6 text-[10px]" />

                        <div className="w-full pt-6 border-t border-gray-50 space-y-4">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            {user.phone && (
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span>{user.phone}</span>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="bg-gray-50 p-6">
                        <h3 className="text-xs font-bold text-gray-400 mb-4">Hoạt động</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">Tham gia từ</span>
                                <span className="text-gray-900 font-bold">2026</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">Buổi họp</span>
                                <span className="text-gray-900 font-bold">12</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right: Detailed Info */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="p-8">
                        <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <UserIcon className="w-5 h-5" />
                                Thông tin tài khoản
                            </h3>
                            <Button variant="outline" size="sm">Chỉnh sửa</Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Họ" value={user.lastName} readOnly />
                            <Input label="Tên" value={user.firstName} readOnly />
                            <Input label="Email" value={user.email} readOnly className="md:col-span-2" />
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Giới thiệu bản thân</label>
                                <p className="p-3 bg-gray-50 rounded-xl text-sm text-gray-600 min-h-[100px]">
                                    {user.bio || "Bạn chưa có thông tin giới thiệu."}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Role Specific Info */}
                    {user.role === "mentor" && user.mentorProfile && (
                        <Card className="p-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
                                <Briefcase className="w-5 h-5" />
                                Hồ sơ Mentor
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Công ty / Tổ chức" value={user.mentorProfile.company || "ISME"} readOnly />
                                <Input label="Vị trí công việc" value={user.mentorProfile.jobTitle || "Professional"} readOnly />
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Chuyên môn</label>
                                    <div className="flex flex-wrap gap-2">
                                        {((user.mentorProfile.expertise as any) || ["Marketing", "Management"]).map((e: string) => (
                                            <Badge key={e} variant="outline" className="bg-white">{e}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {user.role === "mentee" && user.menteeProfile && (
                        <Card className="p-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5" />
                                Hồ sơ Mentee
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Mã sinh viên" value={user.menteeProfile.studentId || "20240001"} readOnly />
                                <Input label="Chuyên ngành" value={user.menteeProfile.major || "Marketing"} readOnly />
                                <Input label="Năm học" value={`Năm thứ ${user.menteeProfile.year || 1}`} readOnly />
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Mục tiêu nghề nghiệp</label>
                                    <p className="p-3 bg-gray-50 rounded-xl text-sm text-gray-600">
                                        {user.menteeProfile.careerGoals || "Đang cập nhật..."}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
