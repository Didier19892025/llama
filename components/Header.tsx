// import Logo from "@/src/ui/Logo"

import Logo from "@/src/ui/Logo"

const Header = () => {
    return (
        <div className="bg-white border-b border-gray-200 shadow-sm py-4">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <div>
                    <div className="relative w-[250px] h-[40px]">
                        <Logo />
                    </div>
                </div>
                <div className="text-right">
                    <h1 className="text-md font-bold text-custom-blue">Your intelligent conversation assistant</h1>
                    <div className="flex justify-end gap-1.5">
                    <p className="text-xs subtitle">Power By Nec </p> <span className="text-xs text-gray-500"> Llama 3.0</span>

                    </div>
                </div>
            </div>
        </div>

    )
}

export default Header