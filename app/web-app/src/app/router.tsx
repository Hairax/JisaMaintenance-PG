import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../shared/layout/MainLayout';
import { HomePage } from '../features/home/pages/HomePage';
import { LoginPage } from '../features/auth/pages/LoginPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [{ index: true, element: <HomePage /> }],
  },
  {
    path: '/login',
    children: [{ path: 'login', element: <LoginPage /> }],
  },
]);
