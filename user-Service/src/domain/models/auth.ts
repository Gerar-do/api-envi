// domain/Auth.ts
export interface LoginCredentials {
    Correo: string;      // Cambié "email" por "Correo"
    contraseña: string;  // Cambié "password" por "contraseña"
  }
  
  export interface AuthResponse {
    token: string;
    user: {
      id: number;
      uuid: string;
      Nombre: string;
      Apellido: string;
      Correo: string;      // Mantén "Correo" en lugar de "email"
      Foto_perfil: string;
      isActive: boolean;
    };
  }
  