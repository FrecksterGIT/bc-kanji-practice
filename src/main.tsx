import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {createBrowserRouter, RouterProvider, Navigate} from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Kanji from './components/Kanji'
import Vocabulary from './components/Vocabulary'
import Settings from './components/Settings'

const router = createBrowserRouter([
    {
        path: import.meta.env.BASE_URL ?? '/',
        element: <App />,
        children: [
            {
                path: '',
                element: <Navigate to="kanji" replace />
            },
            {
                path: 'kanji',
                element: <Kanji />
            },
            {
                path: 'vocabulary',
                element: <Vocabulary />
            },
            {
                path: 'settings',
                element: <Settings />
            }
        ]
    }
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
)
