import React from 'react';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminLayout from '../components/admin/AdminLayout';

const AdminPage: React.FC = () => {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminLayout />
    </ProtectedRoute>
  );
};

export default AdminPage;
