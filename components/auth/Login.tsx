"use client";  // Indicamos que este componente es del lado del cliente (client-side) en Next.js

import React, { useState } from "react";  // Importamos React y useState para manejar el estado local
import { useForm } from "react-hook-form";  // Librería para manejo de formularios
import { zodResolver } from "@hookform/resolvers/zod";  // Resolver para integrar Zod con react-hook-form
import { Mail, Lock, Eye, EyeOff } from "lucide-react";  // Íconos utilizados en el formulario
import Logo from "@/src/ui/Logo";  // Componente Logo que se usa en la interfaz
import { LoginFormValues, loginSchema } from "@/src/schemas/loginSchema";  // Tipos y esquema de validación del formulario de login
import Swal from "sweetalert2";  // Librería para mostrar alertas
import { useRouter } from "next/navigation";

const Login = () => {
    // Estado para manejar la visibilidad de la contraseña
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();  // Hook de Next.js para manejar la navegación

    // useForm para manejar el estado del formulario con validación Zod
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isLoading },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),  // Integra el esquema Zod con el formulario
        mode: "all",  // Activa la validación en todo momento (no solo al enviar el formulario)
    });

    // Función que se ejecuta al enviar el formulario
    const onSubmit = async (data: LoginFormValues) => {
        try {
          Swal.fire({
            title: "Iniciando sesión...",
            text: "Por favor espere...",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });
      
          const response = await fetch('https://www.cloudware.com.co/login_llama', {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // importante para cookies httpOnly
            body: JSON.stringify(data),
          });
      
          const result = await response.json();
      
          if (!response.ok) {
            throw new Error(result.message || "Error al iniciar sesión");
          }
      
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Inicio de sesión exitoso",
            confirmButtonColor: "#3085d6",
            timer: 1500, // Cerramos el modal más rápido para mejor UX
            showConfirmButton: false,
          });
      
          reset();
          
          // Importante: Añadir la redirección aquí
          // Podemos verificar el rol del usuario desde el resultado o usar directamente '/dashboard'
          // para que el middleware se encargue de la redirección según el rol
          setTimeout(() => {
            // Redirigir después de que se cierre el SweetAlert
            if (result.user && result.user.role === "ADMIN") {
              router.push('/chat1/dashboard/newChat');
            } else {
              router.push('/chat1/dashboard/admin');
            }
            // O simplemente router.push('/dashboard'); si prefieres que el middleware decida
          }, 1500); // Este tiempo debe coincidir con el timer del SweetAlert
          
        } catch (error) {
          console.error("Login error:", error);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error instanceof Error ? error.message : "Error desconocido",
            timer: 3000,
            showConfirmButton: false,
          });
        }
      };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-white py-12 px-4 sm:px-6 lg:px-8">
            {/* Contenedor principal con fondo y espaciado */}
            <div className="w-full max-w-[400px] space-y-8 bg-white p-8 rounded-xl shadow-lg">
                {/* Logo y Título */}
                <div className="text-center">
                    <div>
                        <Logo />  {/* Componente de logo */}
                    </div>
                    <h2 className=" text-lg font-extrabold text-custom-blue mt-6">
                        Sign in to your account
                    </h2>
                </div>

                {/* Formulario de inicio de sesión */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        {/* Campo de email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Email address
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    {...register("email")}  // Registro del campo de email
                                    className="block w-full rounded-lg border border-gray-300 pl-10 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                                    placeholder="You_email@la.nec.com"
                                />
                                <Mail
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={18}
                                />
                            </div>
                            {/* Mostrar mensaje de error si existe */}
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Campo de contraseña */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}  // Mostrar contraseña o no según el estado
                                    autoComplete="current-password"
                                    {...register("password")}  // Registro del campo de contraseña
                                    className="block w-full rounded-lg border border-gray-300 pl-10 pr-10 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                                    placeholder="********"
                                />
                                <Lock
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={18}
                                />
                                {/* Botón para mostrar u ocultar la contraseña */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {/* Mostrar mensaje de error si existe */}
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Botón de envío */}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}  // Deshabilitar el botón si está en proceso de envío
                            className="group relative flex w-full justify-center rounded-lg bg-custom-blue px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-purple-300 transition-colors"
                        >
                            {/* Si está cargando, mostrar un ícono de carga */}
                            {isLoading && (
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                            )}
                            {/* Texto en el botón según el estado de carga */}
                            {isLoading ? "Signing in..." : "Sign in"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
