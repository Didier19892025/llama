"use client";

import { useState } from "react";
import { User } from "@/types/users/users";
import {
  Trash,
  Eye,
  User as UserIcon,
  Mail,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from "lucide-react";
import { toTitleCase } from "@/src/utils/functions";
import Detail from "./Detail";
import Swal from "sweetalert2";
import { deleteUser } from "@/actions/users";

interface ListProps {
  users: User[];
  onUserDeleted: (id: number) => void;
}

const List = ({ users, onUserDeleted }: ListProps) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileActionsOpen, setMobileActionsOpen] = useState<number | null>(null);
  
  // Ajustar usuarios por página según el tamaño de la pantalla
  const [usersPerPage, setUsersPerPage] = useState(3);
  
  // Efecto para ajustar usersPerPage según el tamaño de la ventana
  useState(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        if (width < 640) { // sm
          setUsersPerPage(3);
        } else if (width >= 1280) { // xl
          setUsersPerPage(5);
        } else {
          setUsersPerPage(4);
        }
      }
    };
    
    // Configuración inicial
    handleResize();
    
    // Agregar listener de evento resize
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }
    
    // Limpiar el listener al desmontar
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  });

  // Calcular el número total de páginas
  const totalPages = Math.ceil(users.length / usersPerPage);

  // Obtener los usuarios de la página actual
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  // Funciones para la paginación
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Funciones existentes
  const handleView = (user: User) => {
    setSelectedUser(user);
    // Cerrar menú móvil de acciones si está abierto
    setMobileActionsOpen(null);
  };
  
  const closeModal = () => setSelectedUser(null);
  
  // Toggle para el menú de acciones en móvil
  const toggleMobileActions = (userId: number) => {
    if (mobileActionsOpen === userId) {
      setMobileActionsOpen(null);
    } else {
      setMobileActionsOpen(userId);
    }
  };

  // Crear botones de paginación
  const renderPaginationButtons = () => {
    const buttons = [];
    // Ajustar máximo de botones según tamaño de pantalla
    const maxPagesToShow = typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 5;

    // Cálculo para mostrar páginas alrededor de la actual
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors text-xs sm:text-sm ${currentPage === i
            ? "bg-blue-600 text-white font-medium"
            : "text-slate-700 hover:bg-blue-100"
            }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

 // Función para eliminar un usuario usando Server Actions
 const handleDeleteUser = async (id: number, name: string) => {
  try {
    // Cerrar menú móvil de acciones si está abierto
    setMobileActionsOpen(null);
    
    // Mostrar un cuadro de confirmación antes de eliminar
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Está seguro que quiere eliminar a ${name} y todos sus datos?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: 'Eliminando usuario y sus sesiones...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Llamamos a la acción del servidor
      const result = await deleteUser(id);
      
      if (result.success) {
        // Actualizar la UI
        onUserDeleted(id);
        Swal.fire({
          icon: 'success',
          title: 'Usuario eliminado',
          text: result.message,
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        throw new Error(result.message);
      }
    }
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: error instanceof Error ? error.message : 'Error al eliminar el usuario',
    });
  }
};

  return (
   <div className="w-full max-w-6xl mx-auto p-4 sm:p-6">
     <div className="overflow-x-auto rounded-lg sm:rounded-2xl border border-slate-200 shadow-md">
       {/* Versión para escritorio */}
       <table className="hidden sm:table min-w-full text-sm divide-y divide-slate-200">
         <thead className="bg-gradient-to-r from-blue-50 to-slate-50 text-slate-600 uppercase tracking-wider text-xs font-semibold">
           <tr>
             <th className="py-3 sm:py-4 px-2 sm:px-4 text-left whitespace-nowrap">
               <div className="flex items-center gap-1">
                 <UserIcon className="w-4 h-4" />
                 <span className="hidden md:inline">Name</span>
               </div>
             </th>
             <th className="py-3 sm:py-4 px-2 sm:px-4 text-left whitespace-nowrap">
               <div className="flex items-center gap-1">
                 <BadgeCheck className="w-4 h-4" />
                 <span className="hidden md:inline">Username</span>
               </div>
             </th>
             <th className="py-3 sm:py-4 px-2 sm:px-4 text-left whitespace-nowrap">
               <div className="flex items-center gap-1">
                 <Mail className="w-4 h-4" />
                 <span className="hidden md:inline">Email</span>
               </div>
             </th>
             <th className="py-3 sm:py-4 px-2 sm:px-4 text-left whitespace-nowrap">
               <div className="flex items-center gap-1">
                 <UserIcon className="w-4 h-4" />
                 <span className="hidden md:inline">Role</span>
               </div>
             </th>
             <th className="py-3 sm:py-4 px-2 sm:px-4 text-center whitespace-nowrap">
               <div className="flex items-center justify-center gap-1">
                 <Eye className="w-4 h-4" />
                 <span className="hidden md:inline">Actions</span>
               </div>
             </th>
           </tr>
         </thead>
         <tbody className="bg-white divide-y divide-slate-100">
           {currentUsers.map((user) => (
             <tr
               key={user.id}
               className="hover:bg-blue-50/50 transition-colors duration-200"
             >
               <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium">{toTitleCase(user.name)}</td>
               <td className="py-2 sm:py-3 px-2 sm:px-4 text-slate-600">{toTitleCase(user.username)}</td>
               <td className="py-2 sm:py-3 px-2 sm:px-4 text-slate-600">{user.email}</td>
               <td className="py-2 sm:py-3 px-2 sm:px-4 text-slate-600">{toTitleCase(user.role)}</td>
               <td className="py-2 sm:py-3 px-2 sm:px-4">
                 <div className="flex justify-center gap-2 flex-wrap">
                   <button
                     onClick={() => handleView(user)}
                     className="bg-blue-100 text-blue-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:text-emerald-700 transition hover:scale-105"
                     title="View Details"
                   >
                     <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                   </button>
                   <button
                     onClick={() => handleDeleteUser(user.id, user.name)}
                     className="bg-blue-100 text-blue-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:text-red-700 transition hover:scale-105"
                     title="Delete"
                   >
                     <Trash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                   </button>
                 </div>
               </td>
             </tr>
           ))}
         </tbody>
       </table>
       
       {/* Vista para móviles */}
       <div className="sm:hidden divide-y divide-slate-200 ">
         {currentUsers.map((user) => (
           <div key={user.id} className="p-4 bg-white hover:bg-blue-50/50 transition-colors duration-200">
             <div className="flex justify-between items-center">
               <div>
                 <div className="font-medium text-base">{toTitleCase(user.name)}</div>
                 <div className="text-sm text-slate-600">{user.email}</div>
                 <div className="text-xs text-slate-500 mt-1">
                   <span className="inline-block bg-blue-50 px-2 py-0.5 rounded-full">
                     {toTitleCase(user.role)}
                   </span>
                 </div>
               </div>
               <div className="relative">
                 <button
                   onClick={() => toggleMobileActions(user.id)}
                   className="p-2 rounded-full hover:bg-blue-100"
                 >
                   <MoreHorizontal className="w-5 h-5 text-slate-600" />
                 </button>
                 
                 {/* Menú desplegable de acciones para móvil */}
                 {mobileActionsOpen === user.id && (
                   <div className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg z-10 border border-slate-100 w-36">
                     <button
                       onClick={() => handleView(user)}
                       className="flex items-center gap-2 w-full p-3 text-left text-slate-700 hover:bg-blue-50"
                     >
                       <Eye className="w-4 h-4" />
                       <span>Ver detalles</span>
                     </button>
                     <button
                       onClick={() => handleDeleteUser(user.id, user.name)}
                       className="flex items-center gap-2 w-full p-3 text-left text-slate-700 hover:bg-red-50"
                     >
                       <Trash className="w-4 h-4" />
                       <span>Eliminar</span>
                     </button>
                   </div>
                 )}
               </div>
             </div>
           </div>
         ))}
       </div>
     </div>

     {/* Pagination */}
     {users.length > 0 && (
       <div className="flex items-center justify-center mt-4 sm:mt-6">
         <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-full px-1 sm:px-2 py-1 shadow-sm border border-slate-200">
           <button
             onClick={goToPrevPage}
             disabled={currentPage === 1}
             className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
               currentPage === 1
                 ? "text-slate-300 cursor-not-allowed"
                 : "text-slate-700 hover:bg-blue-100"
             }`}
           >
             <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
           </button>

           {renderPaginationButtons()}

           <button
             onClick={goToNextPage}
             disabled={currentPage === totalPages}
             className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
               currentPage === totalPages
                 ? "text-slate-300 cursor-not-allowed"
                 : "text-slate-700 hover:bg-blue-100"
             }`}
           >
             <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
           </button>
         </div>
       </div>
     )}

     {users.length === 0 && (
       <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-slate-400">
         <UserIcon className="w-12 h-12 sm:w-16 sm:h-16 opacity-20 mb-3 sm:mb-4" />
         <p className="text-center">No registered users.</p>
       </div>
     )}

     {/* Información de paginación */}
     {users.length > 0 && (
       <div className="text-center mt-2 sm:mt-3 text-xs sm:text-sm text-slate-500">
         Showing {indexOfFirstUser + 1}-
         {Math.min(indexOfLastUser, users.length)} of {users.length} users
       </div>
     )}

     {selectedUser && (
       <Detail selectedUser={selectedUser} onClose={closeModal} />
     )}
   </div>
  );
};

export default List;