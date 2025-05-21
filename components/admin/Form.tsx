"use client"

import { FC } from "react";
import { User, Mail, Lock, UserCheck, Users, X, Send } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { UserFormData, userSchema } from "@/src/schemas/userSchemas";
import Swal from "sweetalert2";

interface FormProps {
    onclose: (isVisible: boolean) => void;
}

const Form: FC<FormProps> = ({ onclose }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        // reset,
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        mode: "all",
    });

    const onSubmit = async (data: UserFormData) => {
    console.log('datos enviados ', data);

        try {
            Swal.fire({
                title: 'Registrando usuario',
                text: 'Por favor espere...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const response = await fetch('https://www.cloudware.com.co/register_llama', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            console.log('respusta de register: ', result);

            // Swal.close();

            if (!response.ok) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.message || 'Error al registrar usuario',
                    confirmButtonColor: '#3085d6',
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Usuario registrado correctamente',
                    confirmButtonColor: '#3085d6',
                });
                // reset();
                // onclose(false);

            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error instanceof Error ? error.message : 'Error al registrar usuario',
                confirmButtonColor: '#d33',
            });
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50 overflow-auto p-4">
            < div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 w-full max-w-3xl mx-auto" >
                {/* Título con ícono */}
                < div className="flex items-center gap-4 mb-6" >
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                        <User className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Register New User</h2>
                </ div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nombre */}
                        <div className="relative">
                            <label htmlFor="name" className="text-xs font-semibold text-slate-600 mb-1 block">
                                Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    id="name"
                                    type="text"
                                    {...register("name")}
                                    placeholder="Full name"
                                    className={`pl-10 pr-3 py-2 rounded-lg border w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.name ? 'border-red-500' : 'border-slate-200'}`}
                                    aria-invalid={!!errors.name}
                                />
                            </div>
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                        </div>

                        {/* Usuario */}
                        <div className="relative">
                            <label htmlFor="user" className="text-xs font-semibold text-slate-600 mb-1 block">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserCheck className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    id="user"
                                    type="text"
                                    {...register("username")}
                                    placeholder="User name"
                                    className={`pl-10 pr-3 py-2 rounded-lg border w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.username ? 'border-red-500' : 'border-slate-200'}`}
                                    aria-invalid={!!errors.username}
                                />
                            </div>
                            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                        </div>

                        {/* Email */}
                        <div className="relative">
                            <label htmlFor="email" className="text-xs font-semibold text-slate-600 mb-1 block">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    {...register("email")}
                                    placeholder="example@mail.com"
                                    className={`pl-10 pr-3 py-2 rounded-lg border w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.email ? 'border-red-500' : 'border-slate-200'}`}
                                    aria-invalid={!!errors.email}
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        {/* Contraseña */}
                        <div className="relative">
                            <label htmlFor="password" className="text-xs font-semibold text-slate-600 mb-1 block">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    {...register("password")}
                                    placeholder="********"
                                    className={`pl-10 pr-3 py-2 rounded-lg border w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.password ? 'border-red-500' : 'border-slate-200'}`}
                                    aria-invalid={!!errors.password}
                                />
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>

                        {/* Rol */}
                        <div className="relative col-span-1 md:col-span-2">
                            <label htmlFor="role" className="text-xs font-semibold text-slate-600 mb-1 block">
                                Role
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Users className="h-4 w-4 text-gray-400" />
                                </div>
                                <select
                                    id="role"
                                    {...register("role")}
                                    className={`pl-10 pr-3 py-2 rounded-lg border w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.role ? 'border-red-500' : 'border-slate-200'}`}
                                >
                                    <option value="">Select a role</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="USER">User</option>
                                </select>
                            </div>
                            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => onclose(false)}
                            className="bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-200 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                            {isSubmitting ? "Enviando..." : "Enviar"}
                        </button>
                    </div>
                </form>
            </div >
        </div >

    );
};

export default Form;
