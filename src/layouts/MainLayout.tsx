import { Outlet } from "react-router-dom";

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 py-4 text-center text-2xl font-bold">
                MovieVerse
            </header>
            <main className="container mx-auto px-4 py-6">
                <Outlet />
            </main>
            <footer className="bg-gray-800 py-4 text-center">
                &copy; {new Date().getFullYear()} Amrenther, MovieVerse. All rights reserved.
            </footer>
        </div>
    )

}

export default MainLayout;