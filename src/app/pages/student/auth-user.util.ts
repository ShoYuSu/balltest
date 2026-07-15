// 🛡️ Helper กลาง สำหรับแกะข้อมูล user จาก JWT token แทนการอ่านจาก localStorage ตรงๆ
// เพราะตอนนี้ login.component.ts เก็บแค่ 'token' กับ 'img_profile' ลง localStorage เท่านั้น
export interface AuthUser {
  user_id: string;
  role: string;
  full_name: string;
  student_code: string;
  advisor_id: string;
  staff_id: string;
  is_advisor: boolean;
}

export function decodeToken(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Token ไม่ถูกต้อง หรือถูกปลอมแปลง:', error);
    return null;
  }
}

export function getAuthUser(): AuthUser {
  const token = localStorage.getItem('token');
  const payload = token ? decodeToken(token) : null;

  return {
    user_id: payload?.user_id != null ? String(payload.user_id) : '',
    role: (payload?.role || '').toLowerCase().trim(),
    full_name: payload?.full_name || '',
    student_code: payload?.student_code || '',
    advisor_id: payload?.advisor_id != null ? String(payload.advisor_id) : '',
    staff_id: payload?.staff_id != null ? String(payload.staff_id) : '',
    is_advisor: !!payload?.is_advisor,
  };
}
