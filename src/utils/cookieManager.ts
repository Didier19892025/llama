// utils/cookieManager.ts
class CookieManager {
  // Obtener una cookie específica
  static getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find(c => c.startsWith(`${name}=`));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
  }

  // Establecer una cookie
  static setCookie(name: string, value: string, options: {
    expires?: number;
    path?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}) {
    if (typeof document === 'undefined') return;

    const {
      expires = 7, // días
      path = '/',
      secure = process.env.NODE_ENV === 'production',
      sameSite = 'strict'
    } = options;

    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + (expires * 24 * 60 * 60 * 1000));

    let cookieString = `${name}=${encodeURIComponent(value)}; expires=${expirationDate.toUTCString()}; path=${path}; SameSite=${sameSite}`;
    
    if (secure) {
      cookieString += '; Secure';
    }

    document.cookie = cookieString;
  }

  // Eliminar una cookie
  static deleteCookie(name: string, path: string = '/') {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
  }

  // Obtener información del usuario desde las cookies
  static getUserInfo(): {
    name: string | null;
    email: string | null;
    role: string | null;
  } {
    return {
      name: this.getCookie('name'),
      email: this.getCookie('email'),
      role: this.getCookie('role')
    };
  }

  // Limpiar todas las cookies de sesión
  static clearSessionCookies() {
    this.deleteCookie('name');
    this.deleteCookie('email');
    this.deleteCookie('role');
    this.deleteCookie('token');
    this.deleteCookie('user_session');
  }
}

export default CookieManager;