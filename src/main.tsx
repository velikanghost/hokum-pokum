import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.scss'
import Home from './pages/Home.tsx'
import ErrorPage from './error-page.tsx'
import Redeem from './pages/Redeem.tsx'
import Transfer from './pages/Transfer.tsx'
// import { Buffer } from 'buffer'

// window.global = window
// window.Buffer = window.Buffer || Buffer

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/redeem',
    element: <Redeem />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/transfer',
    element: <Transfer />,
    errorElement: <ErrorPage />,
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
