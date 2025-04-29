// src/app/dashboard/admin/page.tsx
"use client"

import Form from "@/components/admin/Form";
import List from "@/components/admin/List";
import { User } from "@/types/users/users";
import { Plus, Users } from "lucide-react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const AdminPage = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

// Función para obtener usuarios
const fetchUsers = async () => {
  try {

    const response = await fetch('/api/users');

    if (!response.ok) {
      throw new Error('Error al cargar usuarios');
    }

    const data = await response.json();

    if (data.success) {
      setUsers(data.users);
    } else {
      throw new Error(data.message || 'Error al cargar usuarios');
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // Mostrar error con SweetAlert
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: error instanceof Error ? error.message : 'Error al cargar usuarios',
    });
  } finally {
    Swal.close(); // Cerrar modal de carga
  }
};

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
  }, []);

  // Función para manejar el cierre del formulario y actualizar usuarios
  const handleFormClose = async (isVisible: boolean) => {
    setIsFormVisible(isVisible);
    
    // Si el formulario se cierra, actualizar la lista de usuarios
    if (!isVisible) {
      await fetchUsers();
    }
  };

  const onUserDeleted = (deletedId: number) => {
    setUsers(users.filter(user => user.id !== deletedId));
  };



  return (
    <div className="max-w-4xl mx-auto mt-6">
        <div className="flex gap-3 items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 p-2 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
            <span className="text-custom-blue">Administration Panel</span>
          </h1>

          {/* Botón para agregar usuario */}
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="hover:bg-blue-600 text-blue-600 hover:text-white p-2 rounded-full shadow-md transition hover:scale-110"
            title="Add User"
            aria-label="Add User"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

      {/* Formulario */}
      {isFormVisible && (
        <Form onclose={handleFormClose} />
      )}

      
      
      {/* Lista de usuarios */}
        <List users={users} onUserDeleted={onUserDeleted}/>
    </div>
  );
};

export default AdminPage;