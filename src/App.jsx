import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import ParentStudentDashboard from './components/ParentStudentDashboard';

export default function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. التحقق من الجلسة الحالية عند الفتح
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      else setLoading(false);
    });

    // 2. الاستماع لتغيرات المصادقة (تسجيل دخول / خروج)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // جلب دور المستخدم من جدول profiles
  const fetchUserRole = async (userId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserRole(data?.role);
    } catch (error) {
      console.error('خطأ في تحديد دور المستخدم:', error.message);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <p className="text-gray-600 font-medium">جاري التحقق من بيانات الدخول...</p>
      </div>
    );
  }

  // إذا لم يكن مسجلاً للدخول، اعرض واجهة تسجيل الدخول
  if (!session) {
    return <Login />;
  }

  // توجيه المستخدم حسب دوره البرمجي
  switch (userRole) {
    case 'admin':
      return <AdminDashboard session={session} />;
    case 'teacher':
      return <TeacherDashboard session={session} />;
    case 'parent':
    case 'student':
      return <ParentStudentDashboard session={session} />;
    default:
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center" dir="rtl">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-2">الحساب غير مرتبط بدور محدد</h2>
            <p className="text-sm text-gray-500 mb-6">المرجو التواصل مع إدارة المؤسسة لتعيين صلاحيات حسابك.</p>
            <button
              onClick={() => supabase.auth.signOut()}
              className="w-full bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      );
  }
    }
