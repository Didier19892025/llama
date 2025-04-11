import Header from "@/components/Header"
import NavigationBar from "@/components/NavigationBar"
import { FC, PropsWithChildren } from "react"

const layout: FC<PropsWithChildren> = ({ children }) => {
    return (
        <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
            {/* Main content area - takes available space */}
            <div className="flex-1">
                <Header />
                {children}
            </div>
            
            {/* Sidebar - Fixed on the right */}
            <NavigationBar />
        </div>
    )
}

export default layout