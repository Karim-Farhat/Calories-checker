
export type Language = 'ar' | 'en';

export interface UserProfile {
  age: string;
  gender: 'male' | 'female' | '';
  weight: string;
}

export interface FoodAnalysis {
  name: string;
  weight: string;
  calories: string;
  healthiness: string;
  description: string;
  isHealthy: boolean;
  rating: number;
  alternatives: string[];
}

export const translations = {
  ar: {
    title: 'Calorie Cam',
    welcome: 'مرحباً بك في Calorie Cam',
    profileTitle: 'بياناتك الشخصية',
    age: 'العمر',
    gender: 'النوع',
    male: 'ذكر',
    female: 'أنثى',
    weight: 'الوزن (كجم)',
    save: 'حفظ المتابعة',
    capture: 'التقط صورة للأكل',
    analyzing: 'جاري تحليل الصورة...',
    resultTitle: 'تحليل الوجبة',
    calories: 'السعرات الحرارية',
    foodWeight: 'الوزن التقريبي',
    healthStatus: 'الحالة الصحية',
    description: 'نبذة عن الأكل',
    isHealthy: 'هل هو مفيد؟',
    rating: 'التقييم',
    alternatives: 'بدائل صحية',
    yes: 'نعم',
    no: 'لا',
    retake: 'صورة أخرى',
    changeProfile: 'تعديل البيانات',
    cameraError: 'خطأ في فتح الكاميرا. يرجى التأكد من إعطاء الصلاحية.',
    selectGender: 'اختر النوع',
    healthy: 'صحي',
    unhealthy: 'غير صحي',
  },
  en: {
    title: 'Calorie Cam',
    welcome: 'Welcome to Calorie Cam',
    profileTitle: 'Personal Profile',
    age: 'Age',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    weight: 'Weight (kg)',
    save: 'Save & Continue',
    capture: 'Capture Food Photo',
    analyzing: 'Analyzing photo...',
    resultTitle: 'Meal Analysis',
    calories: 'Calories',
    foodWeight: 'Approximate Weight',
    healthStatus: 'Health Status',
    description: 'About the food',
    isHealthy: 'Is it healthy?',
    rating: 'Rating',
    alternatives: 'Healthy Alternatives',
    yes: 'Yes',
    no: 'No',
    retake: 'New Photo',
    changeProfile: 'Edit Profile',
    cameraError: 'Camera error. Please ensure permissions are granted.',
    selectGender: 'Select Gender',
    healthy: 'Healthy',
    unhealthy: 'Unhealthy',
  }
};
