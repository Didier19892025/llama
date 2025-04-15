// Archivo: src/ui/Logo.jsx
import Image from "next/image";

const Logo = () => {
    return (
            <Image
                src="/logo_nec.svg" // Ruta relativa a la carpeta public
                alt="Logo nec"
                priority
                fill
                style={{ objectFit: 'contain' }}
            />
    );
};

export default Logo;