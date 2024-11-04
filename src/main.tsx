import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.scss'
import Home from './pages/Home.tsx'
import ErrorPage from './error-page.tsx'
import Transfer from './pages/Transfer.tsx'
import Merchant from './pages/Merchant.tsx'
import { Toaster } from 'sonner'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <ErrorPage />,
  },
  // {
  //   path: '/redeem',
  //   element: <Redeem />,
  //   errorElement: <ErrorPage />,
  // },
  {
    path: '/demo',
    element: <Transfer />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/merchant',
    element: <Merchant />,
    errorElement: <ErrorPage />,
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster />
  </StrictMode>,
)
