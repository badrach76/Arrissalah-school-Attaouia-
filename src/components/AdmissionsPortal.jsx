import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { UserPlus, CheckCircle, XCircle, Clock, Send, ArrowRight } from 'lucide-react';

export default function AdmissionsPortal({ isAdmin, onBack }) {
  const [formData, setFormData] = useState({
    student_full_name: '',
    cycle: 'primary',
    desired_level: '',
    parent_full_name: '',
    phone: '',
    email: '',
  });
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchRequests();
    }
  }, [isAdmin]);

  // جلب الطلبات للإدارة
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admission_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('خطأ في جلب الطلبات:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // إرسال طلب جديد من طرف ولي الأمر
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('admission_requests').insert([formData]);
      if (error) throw error;
      setSubmitted(true);
    } catch (error) {
      alert('حدث خطأ أثناء إرسال الطلب: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // تغيير حالة الطلب من طرف الإدارة (قبول أو رفض)
  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('admission_requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      fetchRequests();
    } catch (error) {
      alert('خطأ في تحديث الحالة: ' + error.message);
    }
  };

  // إذا كان ولي أمر يريد تقديم طلب جديد
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-800">التسجيل القبلي بالمؤسسة</h1>
              <p className="text-xs text-gray-500 mt-1">مؤسسة الرسالة للتعليم (أولي، ابتدائي، إعدادي، ثانوي)</p>
            </div>
            {onBack && (
              <button onClick={onBack} className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
                <ArrowRight size={16} /> العودة
              </button>
            )}
          </div>

          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <h3 className="text-lg font-bold text-gray-800">تم إرسال طلبك بنجاح!</h3>
              <p className="text-sm text-gray-500">ستتواصل معك إدارة المؤسسة قريباً لاستكمال إجراءات التسجيل النهائي.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
              >
                تقديم طلب آخر
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل للتلميذ(ة)</label>
                <input
                  type="text"
                  required
                  value={formData.student_full_name}
                  onChange={(e) => setFormData({ ...formData, student_full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="مثال: يوسف العلوي"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السلك التعليمي</label>
                  <select
                    value={formData.cycle}
                    onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="preschool">التعليم الأولي</option>
                    <option value="primary">التعليم الابتدائي</option>
                    <option value="middle">التعليم الإعدادي</option>
                    <option value="high">التعليم الثانوي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المستوى الدراسي المطلوب</label>
                  <input
                    type="text"
                    required
                    value={formData.desired_level}
                    onChange={(e) => setFormData({ ...formData, desired_level: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="مثال: المستوى الأول ابتدائي"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم ولي الأمر</label>
                <input
                  type="text"
                  required
                  value={formData.parent_full_name}
                  onChange={(e) => setFormData({ ...formData, parent_full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="اسم الأب أو الأم أو الوصي"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف للتواصل</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="06xxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني (اختياري)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition duration-200 shadow-md flex items-center justify-center gap-2"
              >
                <Send size={18} /> إرسال طلب التسجيل القبلي
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // واجهة إدارة طلبات التسجيل (خاصة بالإدارة)
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-lg font-bold text-gray-800">طلبات التسجيل القبلي الواردة</h3>
          <p className="text-xs text-gray-500 mt-0.5">إدارة ومتابعة طلبات التسجيل الجديدة للمؤسسة</p>
        </div>
        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
          إجمالي الطلبات: {requests.length}
        </span>
      </div>

      {loading ? (
        <p className="text-center py-8 text-gray-500">جاري تحميل الطلبات...</p>
      ) : requests.length === 0 ? (
        <p className="text-center py-8 text-gray-500">لا توجد طلبات تسجیل قبلي جديدة مسجلة حالياً.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-gray-100">
                <th className="pb-3 px-3">التلميذ(ة)</th>
                <th className="pb-3 px-3">السلك والمستوى</th>
                <th className="pb-3 px-3">ولي الأمر والهاتف</th>
                <th className="pb-3 px-3 text-center">الحالة</th>
                <th className="pb-3 px-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="py-3 px-3 font-medium text-gray-800">{req.student_full_name}</td>
                  <td className="py-3 px-3 text-gray-600">
                    <span className="block font-medium">{req.desired_level}</span>
                    <span className="text-xs text-gray-400">({req.cycle})</span>
                  </td>
                  <td className="py-3 px-3 text-gray-600">
                    <span className="block font-medium">{req.parent_full_name}</span>
                    <span className="text-xs font-mono text-emerald-600">{req.phone}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                        req.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : req.status === 'rejected'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {req.status === 'approved' ? 'مقبول' : req.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => updateStatus(req.id, 'approved')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs transition"
                    >
                      قبول
                    </button>
                    <button
                      onClick={() => updateStatus(req.id, 'rejected')}
                      className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs transition"
                    >
                      رفض
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
        }
              
