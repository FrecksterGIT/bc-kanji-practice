import {Outlet} from 'react-router-dom'
import Navigation from './components/Navigation'

function App() {
    return (
        <div className="flex min-h-screen flex-col bg-gray-100">
            <Navigation/>
            <div className="flex-grow container mx-auto">
                <Outlet />
            </div>
        </div>
    )
}

export default App
