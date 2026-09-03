import React, { useState } from 'react';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  // جلسة وهمية تجاوزاً للتشغيل المباشر
  const fakeSession = { user: { id: 'admin-bypass-id', email: 'admin@school.com' } };

  return (
    <div dir="rtl">
      <AdminDashboard session={fakeSession} />
    </div>
  );
}
