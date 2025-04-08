
const Header = () => {
    return (
        <div className="bg-white border-b border-gray-200 shadow-sm py-4">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <div>
                    <h1 className="text-mdl font-bold text-purple-700">Yama</h1>
                    <p className="text-gray-600 text-xs">Your intelligent conversation assistant</p>
                </div>
                <div className="text-right">
                    <p className="font-medium text-purple-600">Welcome, John!</p>
                    <p className="text-xs text-gray-500">Happy to assist you today</p>
                </div>
            </div>
        </div>

    )
}

export default Header