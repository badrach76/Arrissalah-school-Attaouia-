const DEV_ADMIN_LOGIN = import.meta.env.VITE_DEV_ADMIN_LOGIN === 'true';
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import ParentStudentDashboard from './components/ParentStudentDashboard';

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session) {
        setSession(session);
        await loadProfile(session.user.id);
      }

      setLoading(false);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      setSession(session);

      if (session) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, full_name, phone')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Profile error:', error);
      await supabase.auth.signOut();
      return;
    }

    setProfile(data);
  };

  const handleLogin = ({ user, role, full_name }) => {
    setSession({
      user,
    });

    setProfile({
      id: user.id,
      role,
      full_name,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-gray-600">
          جاري تحميل المنصة...
        </div>
      </div>
    );
  }
if (DEV_ADMIN_LOGIN && !session) {
  return <AdminDashboard onLogout={handleLogout} />;
}
  if (!session || !profile) {
    return <Login onLogin={handleLogin} />;
  }

  switch (profile.role) {
    case 'admin':
      return <AdminDashboard onLogout={handleLogout} />;

    case 'teacher':
      return <TeacherDashboard onLogout={handleLogout} />;

    case 'student':
    case 'parent':
      return <ParentStudentDashboard onLogout={handleLogout} />;

    default:
      return (
        <div
          className="min-h-screen flex items-center justify-center p-6"
          dir="rtl"
        >
          <div className="text-center">
            <h1 className="text-xl font-bold text-red-600 mb-3">
              الدور غير معروف
            </h1>

            <p className="text-gray-600 mb-5">
              لا يوجد حساب مرتبط بدور صالح في النظام.
            </p>

            <button
              onClick={handleLogout}
              className="px-5 py-2 bg-gray-800 text-white rounded-lg"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      );
  }
}
