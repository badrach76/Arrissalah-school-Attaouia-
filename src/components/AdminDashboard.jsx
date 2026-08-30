import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Users, BookOpen, GraduationCap, DollarSign, LogOut } from 'lucide-react';

export default function AdminDashboard({ session }) {
  const [stats, setStats] = useState({ students: 0, classes: 0, teachers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // جلب عدد التلاميذ
      const { count: studentsCount, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      if (studentsError) throw studentsError;

      // جلب عدد الأقسام
      const { count: classesCount, error: classesError } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true });

      if (classesError) throw classesError;

      // جلب عدد الأساتذة
      const { count: teachersCount, error: teachersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'teacher');

      if (teachersError) throw teachersError;

      setStats({
        students: studentsCount || 0,
        classes: classesCount || 0,
        teachers: teachersCount || 0,
      });
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex" dir="rtl">
      {/* القائمة الجانبية */}
      <aside className="w-64 bg-emerald-800 text-white flex flex-col justify-between hidden md:flex">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6 border-b border-emerald-700 pb-3">مؤسسة الرسالة</h2>
          <nav className="space-y-2">
            <a href="#" className="flex items-center gap-3 p-3 bg-emerald-700 rounded-lg text-sm font-medium">
              <Users size={18} /> لوحة القيادة
            </a>
            <a href="#" className="flex items-center gap-3 p-3 hover:bg-emerald-700 rounded-lg text-sm font-medium transition">
              <GraduationCap size={18} /> إدارة التلاميذ
            </a>
            <a href="#" className="flex items-center gap-3 p-3 hover:bg-emerald-700 rounded-lg text-sm font-medium transition">
              <BookOpen size={18} /> المستويات والأقسام
            </a>
            <a href="#" className="flex items-center gap-3 p-3 hover:bg-emerald-700 rounded-lg text-sm font-medium transition">
              <DollarSign size={18} /> التدبير المالي
            </a>
          </nav>
        </div>
        <div className="p-6 border-t border-emerald-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-emerald-200 hover:text-white text-sm w-full transition"
          >
            <LogOut size={16} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">لوحة تحكم الإدارة</h1>
            <p className="text-sm text-gray-500 mt-1">مرحباً بك، تتبع سير العمليات التربوية للمؤسسة</p>
          </div>
          <button
            onClick={handleLogout}
            className="md:hidden flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium"
          >
            خروج
          </button>
        </header>

        {/* بطاقات الإحصائيات السريعة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">إجمالي التلاميذ</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{loading ? '...' : stats.students}</h3>
            </div>
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
              <GraduationCap size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">عدد الأساتذة</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{loading ? '...' : stats.teachers}</h3>
            </div>
            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
              <Users size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">الأقسام الدراسية</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{loading ? '...' : stats.classes}</h3>
            </div>
            <div className="p-4 bg-amber-50 text-amber-600 rounded-xl">
              <BookOpen size={24} />
            </div>
          </div>
        </div>

        {/* قسم تنبيهات أو جداول إضافية */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">أنشطة المؤسسة الأخيرة</h3>
          <p className="text-sm text-gray-500">لا توجد تنبيهات حديثة مسجلة في النظام حالياً.</p>
        </div>
      </main>
    </div>
  );
  }
        
