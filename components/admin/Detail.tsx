"use client"

import { toTitleCase } from "@/src/utils/functions"
import { User } from "@/types/users/users";
import { BadgeCheck, CalendarClock, CalendarDays, CalendarPlus, CalendarX, Clock, Hourglass, Mail, ShieldCheck, UserIcon, X } from "lucide-react"
import { FC } from "react";

interface DetailProps {
    selectedUser: User;
    onClose: () => void;
}
const Detail: FC<DetailProps> = ({ selectedUser, onClose }) => {

    if (!selectedUser) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50 overflow-auto p-4">
            <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-4xl relative border border-slate-100 animate-slide-up max-h-[90vh] overflow-y-auto">
                <button
                   onClick={onClose}
                    className="absolute top-4 right-4 bg-white text-slate-500 hover:text-slate-700 p-2 rounded-full shadow-md hover:bg-slate-100 transition-all border border-slate-200"
                    title="Close"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                        <UserIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">User Details</h3>
                </div>

                <div className="grid grid-cols-4 gap-3 text-slate-700">
                    <div className="bg-slate-50 p-3 rounded-lg col-span-2">
                        <p className="font-medium flex items-center gap-2">
                            <UserIcon className="w-4 h-4" />
                            Name
                        </p>
                        <p className="text-slate-900">{toTitleCase(selectedUser.name)}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="font-medium flex items-center gap-2">
                            <BadgeCheck className="w-4 h-4" />
                            Username
                        </p>
                        <p className="text-slate-900">{toTitleCase(selectedUser.username)}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="font-medium flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            Role
                        </p>
                        <p className="text-slate-900">{selectedUser.role}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg col-span-2">
                        <p className="font-medium flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                        </p>
                        <p className="text-slate-900">{toTitleCase(selectedUser.email)}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="font-medium flex items-center gap-2">
                            <CalendarPlus className="w-4 h-4" />
                            Created At
                        </p>
                        <p className="text-slate-900">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="font-medium flex items-center gap-2">
                            <CalendarClock className="w-4 h-4" />
                            Updated At
                        </p>
                        <p className="text-slate-900">{new Date(selectedUser.updatedAt).toLocaleString()}</p>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                            <Clock className="w-4 h-4" />
                        </div>
                        <h4 className="font-semibold text-slate-800">Session History</h4>
                    </div>

                    {selectedUser.sessions?.length ? (
                        <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/60 shadow-sm">
                            <table className="w-full text-sm text-slate-700">
                                <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                                    <tr>
                                        <th className="py-3 px-4 text-left font-semibold tracking-wide">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="w-4 h-4 text-blue-500" />
                                                Start
                                            </div>
                                        </th>
                                        <th className="py-3 px-4 text-left font-semibold tracking-wide">
                                            <div className="flex items-center gap-2">
                                                <CalendarX className="w-4 h-4 text-red-500" />
                                                End
                                            </div>
                                        </th>
                                        <th className="py-3 px-4 text-left font-semibold tracking-wide">
                                            <div className="flex items-center gap-2">
                                                <Hourglass className="w-4 h-4 text-yellow-600" />
                                                Duration
                                            </div>
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {selectedUser.sessions.map((session) => (
                                        <tr key={session.id} className="hover:bg-blue-50/30 transition-colors duration-150">
                                            <td className="py-3 px-4">
                                                {new Date(session.timeInit).toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                {session.timeEnd ? (
                                                    new Date(session.timeEnd).toLocaleString()
                                                ) : (
                                                    <span className="text-emerald-600 font-medium">Ongoing</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">{session.timeDuration} min</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-4 rounded-lg text-slate-400 text-center">
                            <Clock className="w-8 h-8 opacity-30 mx-auto mb-2" />
                            <p>No sessions recorded.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Detail