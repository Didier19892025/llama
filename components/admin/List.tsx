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
  ChevronRight
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
  const usersPerPage = 3;

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
  const handleView = (user: User) => setSelectedUser(user);
  const closeModal = () => setSelectedUser(null);

  // Crear botones de paginación
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxPagesToShow = 5; // Número máximo de botones de página a mostrar

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
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${currentPage === i
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
    <div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-md">
        <table className="min-w-full text-sm divide-y divide-slate-200">
          <thead className="bg-gradient-to-r from-blue-50 to-slate-50 text-slate-600 uppercase tracking-wider text-xs font-semibold">
            <tr>
              <th className="py-4 px-6 text-left">
                <div className="flex items-center gap-1">
                  <UserIcon className="w-4 h-4" />
                  Name
                </div>
              </th>
              <th className="py-4 px-6 text-left">
                <div className="flex items-center gap-1">
                  <BadgeCheck className="w-4 h-4" />
                  Username
                </div>
              </th>
              <th className="py-4 px-6 text-left">
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Email
                </div>
              </th>
              <th className="py-4 px-6 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Eye className="w-4 h-4" />
                  Actions
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
                <td className="py-4 px-6 font-medium">{toTitleCase(user.name)}</td>
                <td className="py-4 px-6 text-slate-600">{toTitleCase(user.username)}</td>
                <td className="py-4 px-6 text-slate-600">{toTitleCase(user.email)}</td>
                <td className="py-4 px-6">
                  <div className="flex justify-center gap-3">
                   
                  
                    <button
                      onClick={() => handleView(user)}
                      className="bg-blue-100 text-blue-600 p-2 rounded-xl hover:text-emerald-700 transition hover:scale-110"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      className="bg-blue-100 text-blue-600 p-2 rounded-xl hover:text-red-700 transition hover:scale-110"
                      title="Delete"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {users.length > 0 && (
        <div className="flex items-center justify-center mt-6">
          <div className="flex items-center gap-2 bg-white rounded-full px-2 py-1 shadow-sm border border-slate-200">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${currentPage === 1
                ? "text-slate-300 cursor-not-allowed"
                : "text-slate-700 hover:bg-blue-100"
                }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {renderPaginationButtons()}

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${currentPage === totalPages
                ? "text-slate-300 cursor-not-allowed"
                : "text-slate-700 hover:bg-blue-100"
                }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <UserIcon className="w-16 h-16 opacity-20 mb-4" />
          <p className="text-center">No registered users.</p>
        </div>
      )}

      {/* Información de paginación */}
      {users.length > 0 && (
        <div className="text-center mt-3 text-sm text-slate-500">
          Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, users.length)} of {users.length} users
        </div>
      )}

      {selectedUser && (
        <Detail
          selectedUser={selectedUser}
          onClose={closeModal} // ← función que hace setSelectedUser(null)
        />
      )}
    </div>
  );
};

export default List;