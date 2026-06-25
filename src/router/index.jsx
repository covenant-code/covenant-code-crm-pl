import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import { ProtectedRoute } from '../components/common/ProtectedRoute'
import LoginPage      from '../pages/LoginPage'
import RegisterPage   from '../pages/RegisterPage'
import DashboardPage  from '../pages/DashboardPage'
import CoursesPage    from '../pages/CoursesPage'
import LeadsPage      from '../pages/LeadsPage'
import StudentsPage   from '../pages/StudentsPage'
import GroupsPage     from '../pages/GroupsPage'
import LessonsPage    from '../pages/LessonsPage'
import UsersPage      from '../pages/UsersPage'
import TeachersPage   from '../pages/TeachersPage'
import NotFoundPage   from '../pages/NotFoundPage'

const router = createBrowserRouter([
  { path: '/login',    element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },

  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true,       element: <DashboardPage /> },
      { path: 'courses',   element: <CoursesPage /> },
      { path: 'leads',     element: <LeadsPage /> },
      { path: 'students',  element: <StudentsPage /> },
      { path: 'groups',    element: <GroupsPage /> },
      { path: 'lessons',   element: <LessonsPage /> },
      { path: 'teachers',  element: <TeachersPage /> },
      {
        path: 'users',
        element: (
          <ProtectedRoute roles={['ADMIN']}>
            <UsersPage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  { path: '/404', element: <NotFoundPage /> },
  { path: '*',    element: <Navigate to="/404" replace /> },
])

export default router
