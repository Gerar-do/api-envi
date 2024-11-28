export interface User {
    id: number;
    uuid: string;
    Nombre: string;
    Apellido: string;
    Correo: string;
    contraseña: string;
    Foto_perfil: string;
    telefono: string; // Nuevo campo
    isActive: boolean;
}