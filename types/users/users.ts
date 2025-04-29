export interface Session {
    id: number;
    timeInit: string;
    timeEnd: string | null;
    timeDuration: number;
  }
  
  export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    role: "USER" | "ADMIN";
    createdAt: string;
    updatedAt: string;
    sessions?: Session[];
  }
  