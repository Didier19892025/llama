import Logo from "@/src/ui/Logo"

const Header = () => {
    return (
        <div className="bg-white border-b border-gray-200 shadow-sm py-4">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <div>
                    <h1 className="text-mdl font-bold text-purple-700">Your intelligent conversation assistant</h1>
                    <p className="text-gray-600 text-xs">Llama 3.0</p>
                </div>
                <div className="text-right">
               <div className="relative w-[100px] h-[40px]">
               <Logo />
               </div>
                    <p className="text-xs text-gray-500">Power By Nec</p>
                </div>
            </div>
        </div>

    )
}

export default Header