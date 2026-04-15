// src/app/admin/layout.js
import AdminAuthGuard from '@/components/admin/AdminAuthGuard'

export const metadata = { title: { default: 'Admin', template: '%s | Sullivan Admin' } }

export default function AdminLayout({ children }) {
  return (
    <AdminAuthGuard>
      {children}
    </AdminAuthGuard>
  )
}
// end of file
