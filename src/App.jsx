import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import ParentStudentDashboard from './components/ParentStudentDashboard';
import AdmissionsPortal from './components/AdmissionsPortal';

export default function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('main');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      else setLoading(false);
    });

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

  const fetchUserRole = async (userId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        // إذا لم يتم العثور على الجدول أو السجل، امنح دوراً افتراضياً أو تجنب الانهيار
        console.warn('تنبيه في جلب الصلاحيات، سيتم التعامل كـ زائر أو حساب عام:', error.message);
        setUserRole('visitor');
      } else {
        setUserRole(data?.role || 'visitor');
      }
    } catch (error) {
      console.error('خطأ غير متوقع:', error.message);
      setUserRole('visitor');
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

  if (!session && currentView === 'admission') {
    return <AdmissionsPortal isAdmin={false} onBack={() => setCurrentView('main')} />;
  }

  if (!session) {
    return (
      <div>
        <Login />
        <div className="text-center pb-6 bg-gray-50">
          <button
            onClick={() => setCurrentView('admission')}
            className="text-sm text-emerald-600 hover:underline font-medium"
          >
            أنت ولي أمر جديد وترغب في تقديم طلب تسجيل قبلي لأبنائك؟ انقر هنا
          </button>
        </div>
      </div>
    );
  }

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
            <h2 className="text-xl font-bold text-gray-800 mb-2">تم تسجيل الدخول بنجاح</h2>
            <p className="text-sm text-gray-500 mb-6">حسابك مفعل، لكن لم يتم ربطه بدور محدد بعد في قاعدة البيانات.</p>
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
