// Archivo: src/ui/Logo.jsx
import Image from "next/image";

const Logo = () => {
    return (
        <div className="relative w-[100px] h-[40px]">
            <Image
                src="/logo_nec.svg" // Ruta relativa a la carpeta public
                alt="Logo nec"
                priority
                fill
                style={{ objectFit: 'contain' }}
            />
        </div>
    );
};

export default Logo;