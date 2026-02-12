"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { updateProfile } from "@/lib/actions/user";
import {
    User as UserIcon,
    Mail,
    Phone,
    Briefcase,
    GraduationCap,
    Edit3,
    X,
    Check
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

interface ProfileEditorProps {
    user: any;
    meetingCount: number;
}

export function ProfileEditor({ user, meetingCount }: ProfileEditorProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || "",
        bio: user.bio || "",
    });

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateProfile(formData);
            setIsEditing(false);
            router.refresh();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const joinYear = new Date(user.createdAt).getFullYear();

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-black">Hồ sơ cá nhân</h1>
                <p className="text-[#666] text-sm">Thông tin tài khoản và thiết lập cá nhân của bạn</p>
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
                        <h2 className="text-xl font-semibold text-black">{user.firstName} {user.lastName}</h2>
                        <p className="text-xs font-medium text-[#999] mt-1 mb-4">{user.role}</p>
                        <Badge status={user.isActive ? "active" : "offline"} className="mb-6 text-[10px]" />

                        <div className="w-full pt-6 border-t border-[#eaeaea] space-y-4">
                            <div className="flex items-center gap-3 text-sm text-[#666]">
                                <Mail className="w-4 h-4 text-[#999]" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            {user.phone && (
                                <div className="flex items-center gap-3 text-sm text-[#666]">
                                    <Phone className="w-4 h-4 text-[#999]" />
                                    <span>{user.phone}</span>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="bg-[#fafafa] p-6 border border-[#eaeaea]">
                        <h3 className="text-[11px] font-semibold text-[#999] mb-4">Hoạt động</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-[#666] font-medium">Tham gia từ</span>
                                <span className="text-black font-semibold">{joinYear}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[#666] font-medium">Buổi họp</span>
                                <span className="text-black font-semibold">{meetingCount}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right: Detailed Info */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="p-8">
                        <div className="flex items-center justify-between mb-8 border-b border-[#eaeaea] pb-4">
                            <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                                <UserIcon className="w-5 h-5" />
                                Thông tin tài khoản
                            </h3>
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({
                                                firstName: user.firstName,
                                                lastName: user.lastName,
                                                phone: user.phone || "",
                                                bio: user.bio || "",
                                            });
                                        }}
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Hủy
                                    </Button>
                                    <Button size="sm" onClick={handleSave} isLoading={isLoading}>
                                        <Check className="w-4 h-4 mr-1" />
                                        Lưu
                                    </Button>
                                </div>
                            ) : (
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                    <Edit3 className="w-4 h-4 mr-1" />
                                    Chỉnh sửa
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Họ"
                                value={isEditing ? formData.lastName : user.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                readOnly={!isEditing}
                            />
                            <Input
                                label="Tên"
                                value={isEditing ? formData.firstName : user.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                readOnly={!isEditing}
                            />
                            <Input label="Email" value={user.email} readOnly className="md:col-span-2" />
                            {isEditing && (
                                <Input
                                    label="Số điện thoại"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="md:col-span-2"
                                    placeholder="0912 345 678"
                                />
                            )}
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-[12px] font-medium text-[#666]">Giới thiệu bản thân</label>
                                {isEditing ? (
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full min-h-[100px] p-3 rounded-[8px] border border-[#eaeaea] bg-white text-black text-sm placeholder:text-[#999] transition-all duration-200 focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 hover:border-[#999]"
                                        placeholder="Chia sẻ đôi điều về bạn..."
                                    />
                                ) : (
                                    <p className="p-3 bg-[#fafafa] rounded-[8px] text-sm text-[#666] min-h-[100px] border border-[#eaeaea]">
                                        {user.bio || "Bạn chưa có thông tin giới thiệu."}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Role Specific Info */}
                    {user.role === "mentor" && user.mentorProfile && (
                        <Card className="p-8">
                            <h3 className="text-lg font-semibold text-black mb-8 flex items-center gap-2">
                                <Briefcase className="w-5 h-5" />
                                Hồ sơ Mentor
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Công ty / Tổ chức" value={user.mentorProfile.company || "ISME"} readOnly />
                                <Input label="Vị trí công việc" value={user.mentorProfile.jobTitle || "Professional"} readOnly />
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[12px] font-medium text-[#666]">Chuyên môn</label>
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
                            <h3 className="text-lg font-semibold text-black mb-8 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5" />
                                Hồ sơ Mentee
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Mã sinh viên" value={user.menteeProfile.studentId || "20240001"} readOnly />
                                <Input label="Chuyên ngành" value={user.menteeProfile.major || "Marketing"} readOnly />
                                <Input label="Năm học" value={`Năm thứ ${user.menteeProfile.year || 1}`} readOnly />
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[12px] font-medium text-[#666]">Mục tiêu nghề nghiệp</label>
                                    <p className="p-3 bg-[#fafafa] rounded-[8px] text-sm text-[#666] border border-[#eaeaea]">
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
