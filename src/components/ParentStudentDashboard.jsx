import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Award, CheckCircle, AlertCircle, User, LogOut, BookOpen } from 'lucide-react';

export default function ParentStudentDashboard({ session }) {
  const [studentInfo, setStudentInfo] = useState(null);
  const [grades, setGrades] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const userId = session.user.id;
      const userRole = session.user.user_metadata?.role || 'student'; // أو استعلام جدول profiles

      // 1. جلب بيانات التلميذ (سواء كان هو المسجل أو ولي الأمر المرتبط به)
      let query = supabase.from('students').select(`
        id,
        massar_code,
        profiles:profile_id (full_name),
        classes (level_name, section, cycle)
      `);

      if (userRole === 'parent') {
        query = query.eq('parent_id', userId);
      } else {
        query = query.eq('profile_id', userId);
      }

      const { data: studentData, error: studentError } = await query.single();
      if (studentError) throw studentError;

      setStudentInfo(studentData);

      if (studentData) {
        // 2. جلب نقط التلميذ
        const { data: gradesData, error: gradesError } = await supabase
          .from('grades')
          .select('*')
          .eq('student_id', studentData.id);

        if (!gradesError) setGrades(gradesData || []);

        // 3. جلب سجلات الغياب والتأخير
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendances')
          .select('*')
          .eq('student_id', studentData.id)
          .order('date', { ascending: false });

        if (!attendanceError) setAttendances(attendanceData || []);
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات التلميذ:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <p className="text-gray-600 font-medium">جاري تحميل بيانات التلميذ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col" dir="rtl">
      {/* شريط العلو */}
      <header className="bg-emerald-800 text-white shadow-sm p-4 px-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">مؤسسة الرسالة للتعليم</h1>
          <p className="text-xs text-emerald-200 mt-0.5">فضاء المتابعة المدرسية للأسر والتلاميذ</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          <LogOut size={16} /> خروج
        </button>
      </header>

      {/* المحتوى */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* بطاقة معلومات التلميذ */}
        {studentInfo ? (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold text-xl">
                <User size={28} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">{studentInfo.profiles?.full_name}</h2>
                <p className="text-sm text-gray-500 font-mono mt-0.5">رقم مسار: {studentInfo.massar_code}</p>
              </div>
            </div>
            <div className="bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl text-sm font-medium border border-emerald-100">
              {studentInfo.classes?.level_name} - قسم {studentInfo.classes?.section} ({studentInfo.classes?.cycle})
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-center text-sm border border-amber-200">
            لا توجد بيانات تلميذ مرتبطة بهذا الحساب حالياً. المرجو ربط الحساب برقم مسار من طرف الإدارة.
          </div>
        )}

        {/* شبكة البيانات (النقاط والغياب) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* جدول النقط */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 text-emerald-700">
              <Award size={20} />
              <h3 className="font-bold text-gray-800">النتائج الدراسية والنقاط</h3>
            </div>
            {grades.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">لا توجد نقط مسجلة حتى الآن.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-100">
                      <th className="pb-2">المادة</th>
                      <th className="pb-2">نوع التقييم</th>
                      <th className="pb-2 text-center">النقطة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {grades.map((grade) => (
                      <tr key={grade.id} className="hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-800">{grade.subject}</td>
                        <td className="py-3 text-gray-500 text-xs">{grade.exam_type}</td>
                        <td className="py-3 text-center font-bold text-emerald-600">{grade.score} / 20</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* جدول الغياب والتأخيرات */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 text-emerald-700">
              <CheckCircle size={20} />
              <h3 className="font-bold text-gray-800">سجل الغياب والتأخير</h3>
            </div>
            {attendances.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">سجل الحضور نظيف ولا توجد غيابات مسجلة.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-100">
                      <th className="pb-2">التاريخ</th>
                      <th className="pb-2">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {attendances.map((att) => (
                      <tr key={att.id} className="hover:bg-gray-50">
                        <td className="py-3 text-gray-600 font-mono">{att.date}</td>
                        <td className="py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                              att.status === 'present'
                                ? 'bg-emerald-50 text-emerald-700'
                                : att.status === 'absent'
                                ? 'bg-red-50 text-red-700'
                                : att.status === 'late'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {att.status === 'present'
                              ? 'حاضر'
                              : att.status === 'absent'
                              ? 'غائب'
                              : att.status === 'late'
                              ? 'متأخر'
                              : 'معذور'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
    }
            
