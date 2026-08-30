import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { BookOpen, Users, CheckSquare, Award, LogOut } from 'lucide-react';

export default function TeacherDashboard({ session }) {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('attendance'); // attendance أو grades

  // حالة الغياب
  const [attendanceData, setAttendanceData] = useState({});
  // حالة النقاط
  const [gradesData, setGradesData] = useState({});
  const [subject, setSubject] = useState('');
  const [examType, setExamType] = useState('المراقبة المستمرة 1');

  useEffect(() => {
    fetchTeacherClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents(selectedClass);
    }
  }, [selectedClass]);

  // جلب الأقسام المسندة للأستاذ
  const fetchTeacherClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*');

      if (error) throw error;
      setClasses(data || []);
      if (data && data.length > 0) {
        setSelectedClass(data[0].id);
      }
    } catch (error) {
      console.error('خطأ في جلب الأقسام:', error.message);
    }
  };

  // جلب تلاميذ القسم المحدد
  const fetchClassStudents = async (classId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          massar_code,
          profiles:profile_id (full_name)
        `)
        .eq('class_id', classId);

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('خطأ في جلب التلاميذ:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // حفظ الغياب
  const handleSaveAttendance = async () => {
    try {
      const records = students.map((student) => ({
        student_id: student.id,
        status: attendanceData[student.id] || 'present',
        date: new Date().toISOString().split('T')[0],
      }));

      const { error } = await supabase.from('attendances').insert(records);
      if (error) throw error;

      alert('تم حفظ الغياب بنجاح!');
    } catch (error) {
      alert('خطأ أثناء حفظ الغياب: ' + error.message);
    }
  };

  // حفظ النقاط
  const handleSaveGrades = async () => {
    try {
      if (!subject) {
        alert('المرجو تحديد المادة الدراسية أولاً');
        return;
      }

      const records = students.map((student) => ({
        student_id: student.id,
        subject: subject,
        exam_type: examType,
        score: parseFloat(gradesData[student.id]) || 0,
        teacher_id: session.user.id,
      }));

      const { error } = await supabase.from('grades').insert(records);
      if (error) throw error;

      alert('تم حفظ النقاط بنجاح!');
    } catch (error) {
      alert('خطأ أثناء حفظ النقاط: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row" dir="rtl">
      {/* القائمة الجانبية للأستاذ */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between p-6">
        <div>
          <h2 className="text-xl font-bold mb-6 border-b border-slate-800 pb-3">فضاء الأستاذ</h2>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition ${
                activeTab === 'attendance' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <CheckSquare size={18} /> تسجيل الغياب
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition ${
                activeTab === 'grades' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Award size={18} /> مسك النقط والتقييم
            </button>
          </nav>
        </div>
        <div className="pt-6 border-t border-slate-800 mt-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm w-full transition"
          >
            <LogOut size={16} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">تدبير القسم والعمليات البيداغوجية</h1>
            <p className="text-sm text-gray-500 mt-1">اختر القسم المدرسي لإدارة الغياب أو إدخال النقط</p>
          </div>

          {/* اختيار القسم */}
          <div className="w-full md:w-auto">
            <label className="block text-xs font-medium text-gray-500 mb-1">القسم الدراسي</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white w-full md:w-64"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.level_name} - قسم {c.section} ({c.cycle})
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* محتوى التبويب: الغياب */}
        {activeTab === 'attendance' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">ورقة الغياب اليومية</h3>
              <button
                onClick={handleSaveAttendance}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm"
              >
                حفظ الغياب
              </button>
            </div>

            {loading ? (
              <p className="text-center py-8 text-gray-500">جاري تحميل لائحة التلاميذ...</p>
            ) : students.length === 0 ? (
              <p className="text-center py-8 text-gray-500">لا توجد سجلات تلاميذ مسجلة لهذا القسم حالياً.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-600 text-sm">
                      <th className="pb-3 px-4">رقم مسار</th>
                      <th className="pb-3 px-4">اسم التلميذ</th>
                      <th className="pb-3 px-4 text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-gray-600">{student.massar_code}</td>
                        <td className="py-3 px-4 font-medium text-gray-800">{student.profiles?.full_name}</td>
                        <td className="py-3 px-4 text-center">
                          <select
                            value={attendanceData[student.id] || 'present'}
                            onChange={(e) =>
                              setAttendanceData({ ...attendanceData, [student.id]: e.target.value })
                            }
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="present">حاضر</option>
                            <option value="absent">غائب</option>
                            <option value="late">متأخر</option>
                            <option value="excused">معذور</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* محتوى التبويب: النقاط */}
        {activeTab === 'grades' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المادة الدراسية</label>
                <input
                  type="text"
                  placeholder="مثال: الرياضيات، اللغة العربية..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع التقييم</label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="المراقبة المستمرة 1">المراقبة المستمرة 1</option>
                  <option value="المراقبة المستمرة 2">المراقبة المستمرة 2</option>
                  <option value="الامتحان الموحد">الامتحان الموحد</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6 pt-4 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">إدخال النقط (على 20)</h3>
              <button
                onClick={handleSaveGrades}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm"
              >
                حفظ النقط
              </button>
            </div>

            {loading ? (
              <p className="text-center py-8 text-gray-500">جاري تحميل لائحة التلاميذ...</p>
            ) : students.length === 0 ? (
              <p className="text-center py-8 text-gray-500">لا توجد سجلات تلاميذ مسجلة لهذا القسم حالياً.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-600 text-sm">
                      <th className="pb-3 px-4">رقم مسار</th>
                      <th className="pb-3 px-4">اسم التلميذ</th>
                      <th className="pb-3 px-4 text-center w-40">النقطة (/20)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-gray-600">{student.massar_code}</td>
                        <td className="py-3 px-4 font-medium text-gray-800">{student.profiles?.full_name}</td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.25"
                            placeholder="0.00"
                            value={gradesData[student.id] || ''}
                            onChange={(e) =>
                              setGradesData({ ...gradesData, [student.id]: e.target.value })
                            }
                            className="w-24 text-center px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-emerald-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
        }
        
