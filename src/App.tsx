import {Outlet} from 'react-router-dom'
import Navigation from './components/Navigation'
import {UserProvider, useUser} from './contexts/UserContext'

// Wrapper component that handles loading state
const AppContent = () => {
    const {loading} = useUser();

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col bg-gray-100">
                <div className="flex-grow container mx-auto flex items-center justify-center">
                    <div className="text-xl">Loading user data...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-gray-100">
            <Navigation/>
            <div className="flex-grow container mx-auto">
                <Outlet />
            </div>
        </div>
    );
};

function App() {
    return (
        <UserProvider>
            <AppContent />
        </UserProvider>
    );
}

export default App
