export const LANGS = {
  ar: { name:'العربية',   flag:'🇸🇦', dir:'rtl', locale:'ar-SA' },
  en: { name:'English',   flag:'🇬🇧', dir:'ltr', locale:'en-US' },
  fr: { name:'Français',  flag:'🇫🇷', dir:'ltr', locale:'fr-FR' },
  tr: { name:'Türkçe',    flag:'🇹🇷', dir:'ltr', locale:'tr-TR' },
  ur: { name:'اردو',      flag:'🇵🇰', dir:'rtl', locale:'ur-PK' },
  id: { name:'Indonesia', flag:'🇮🇩', dir:'ltr', locale:'id-ID' },
}

export const T = {
  ar: {
    // Navigation
    dashboard:'لوحة التحكم', accounting:'المحاسبة', hr:'الموارد البشرية',
    projects:'المشاريع', crm:'العملاء', inventory:'المخزون',
    purchasing:'المشتريات', pos:'نقاط البيع', contracts:'العقود',
    settings:'الإعدادات', users:'المستخدمون', companies:'الشركات',
    reports:'التقارير', audit:'سجل الأحداث', notifications:'الإشعارات',
    // Auth
    login:'تسجيل الدخول', logout:'تسجيل الخروج', register:'إنشاء حساب',
    email:'البريد الإلكتروني', password:'كلمة المرور',
    confirmPassword:'تأكيد كلمة المرور', name:'الاسم الكامل',
    forgotPassword:'نسيت كلمة المرور؟', resetPassword:'إعادة تعيين',
    sendResetLink:'إرسال رابط الاستعادة', backToLogin:'العودة للدخول',
    loginBtn:'دخول ←', registerBtn:'إنشاء الشركة 🚀',
    resetSent:'تم إرسال رابط الاستعادة — تحقق من بريدك',
    // Company
    companyName:'اسم الشركة', companyEmail:'بريد الشركة',
    adminName:'اسم المدير', currency:'العملة', country:'الدولة',
    language:'اللغة', industry:'القطاع', registerCompany:'تسجيل شركة جديدة',
    // CRUD
    add:'إضافة', edit:'تعديل', delete:'حذف', save:'حفظ', cancel:'إلغاء',
    search:'بحث...', filter:'تصفية', export:'تصدير', print:'طباعة',
    import:'استيراد', refresh:'تحديث', view:'عرض', close:'إغلاق',
    confirm:'تأكيد', yes:'نعم', no:'لا',
    // Status
    active:'نشط', inactive:'غير نشط', pending:'معلق', approved:'معتمد',
    rejected:'مرفوض', draft:'مسودة', paid:'مدفوع', unpaid:'غير مدفوع',
    overdue:'متأخر', cancelled:'ملغى', completed:'مكتمل', partial:'جزئي',
    // Table
    actions:'إجراءات', status:'الحالة', date:'التاريخ', total:'الإجمالي',
    name:'الاسم', description:'الوصف', amount:'المبلغ', quantity:'الكمية',
    price:'السعر', type:'النوع', notes:'ملاحظات', reference:'المرجع',
    // Dashboard
    revenue:'الإيرادات', expenses:'المصروفات', profit:'الربح',
    employees:'الموظفون', invoices:'الفواتير', orders:'الطلبات',
    customers:'العملاء', products:'المنتجات', thisMonth:'هذا الشهر',
    thisYear:'هذا العام', overdueTasks:'مهام متأخرة', lowStock:'مخزون منخفض',
    // Messages
    loading:'جاري التحميل...', noData:'لا توجد بيانات', error:'حدث خطأ',
    success:'تم بنجاح', deleteConfirm:'هل أنت متأكد من الحذف؟ لا يمكن التراجع.',
    saved:'تم الحفظ', deleted:'تم الحذف', updated:'تم التحديث',
    welcomeBack:'مرحباً بعودتك', welcome:'مرحباً',
    // Placeholders
    searchPlaceholder:'ابحث هنا...', emailPlaceholder:'example@email.com',
    passwordPlaceholder:'••••••••', namePlaceholder:'محمد أحمد',
    // Role names
    superadmin:'مدير النظام', admin:'مدير', manager:'مشرف',
    accountant:'محاسب', hr_manager:'مدير HR', sales:'مبيعات',
    warehouse:'مستودعات', cashier:'كاشير', employee:'موظف', viewer:'مشاهد',
    // Modules
    financialSummary:'الملخص المالي', revenueChart:'مخطط الإيرادات',
    recentActivity:'النشاط الأخير', quickActions:'إجراءات سريعة',
    pendingInvoices:'فواتير معلقة', overdueInvoices:'فواتير متأخرة',
    newInvoice:'فاتورة جديدة', newEmployee:'موظف جديد',
    newProject:'مشروع جديد', newCustomer:'عميل جديد',
    newProduct:'منتج جديد', newPurchaseOrder:'طلب شراء',
    newContract:'عقد جديد', newTransaction:'معاملة جديدة',
    // Pagination
    showing:'عرض', of:'من', perPage:'لكل صفحة', page:'صفحة',
    previous:'السابق', next:'التالي', first:'الأول', last:'الأخير',
    // Settings
    profile:'الملف الشخصي', security:'الأمان', appearance:'المظهر',
    companySettings:'إعدادات الشركة', userManagement:'إدارة المستخدمين',
    changePassword:'تغيير كلمة المرور', currentPassword:'كلمة المرور الحالية',
    newPassword:'كلمة المرور الجديدة', passwordChanged:'تم تغيير كلمة المرور',
    lightMode:'فاتح', darkMode:'داكن', systemMode:'تلقائي',
    // Trial
    trialDays:'يوم تجريبي مجاناً', trialExpired:'انتهت الفترة التجريبية',
  },
  en: {
    dashboard:'Dashboard', accounting:'Accounting', hr:'HR',
    projects:'Projects', crm:'CRM', inventory:'Inventory',
    purchasing:'Purchasing', pos:'Point of Sale', contracts:'Contracts',
    settings:'Settings', users:'Users', companies:'Companies',
    reports:'Reports', audit:'Audit Log', notifications:'Notifications',
    login:'Sign In', logout:'Sign Out', register:'Create Account',
    email:'Email Address', password:'Password',
    confirmPassword:'Confirm Password', name:'Full Name',
    forgotPassword:'Forgot password?', resetPassword:'Reset Password',
    sendResetLink:'Send Reset Link', backToLogin:'Back to Sign In',
    loginBtn:'Sign In →', registerBtn:'Create Company 🚀',
    resetSent:'Reset link sent — check your inbox',
    companyName:'Company Name', companyEmail:'Company Email',
    adminName:'Admin Name', currency:'Currency', country:'Country',
    language:'Language', industry:'Industry', registerCompany:'Register New Company',
    add:'Add', edit:'Edit', delete:'Delete', save:'Save', cancel:'Cancel',
    search:'Search...', filter:'Filter', export:'Export', print:'Print',
    import:'Import', refresh:'Refresh', view:'View', close:'Close',
    confirm:'Confirm', yes:'Yes', no:'No',
    active:'Active', inactive:'Inactive', pending:'Pending', approved:'Approved',
    rejected:'Rejected', draft:'Draft', paid:'Paid', unpaid:'Unpaid',
    overdue:'Overdue', cancelled:'Cancelled', completed:'Completed', partial:'Partial',
    actions:'Actions', status:'Status', date:'Date', total:'Total',
    name:'Name', description:'Description', amount:'Amount', quantity:'Qty',
    price:'Price', type:'Type', notes:'Notes', reference:'Reference',
    revenue:'Revenue', expenses:'Expenses', profit:'Profit',
    employees:'Employees', invoices:'Invoices', orders:'Orders',
    customers:'Customers', products:'Products', thisMonth:'This Month',
    thisYear:'This Year', overdueTasks:'Overdue Tasks', lowStock:'Low Stock',
    loading:'Loading...', noData:'No data found', error:'An error occurred',
    success:'Success', deleteConfirm:'Are you sure? This cannot be undone.',
    saved:'Saved', deleted:'Deleted', updated:'Updated',
    welcomeBack:'Welcome back', welcome:'Welcome',
    searchPlaceholder:'Search here...', emailPlaceholder:'example@email.com',
    passwordPlaceholder:'••••••••', namePlaceholder:'John Smith',
    superadmin:'Super Admin', admin:'Admin', manager:'Manager',
    accountant:'Accountant', hr_manager:'HR Manager', sales:'Sales',
    warehouse:'Warehouse', cashier:'Cashier', employee:'Employee', viewer:'Viewer',
    financialSummary:'Financial Summary', revenueChart:'Revenue Chart',
    recentActivity:'Recent Activity', quickActions:'Quick Actions',
    pendingInvoices:'Pending Invoices', overdueInvoices:'Overdue Invoices',
    newInvoice:'New Invoice', newEmployee:'New Employee',
    newProject:'New Project', newCustomer:'New Customer',
    newProduct:'New Product', newPurchaseOrder:'Purchase Order',
    newContract:'New Contract', newTransaction:'New Transaction',
    showing:'Showing', of:'of', perPage:'per page', page:'Page',
    previous:'Previous', next:'Next', first:'First', last:'Last',
    profile:'Profile', security:'Security', appearance:'Appearance',
    companySettings:'Company Settings', userManagement:'User Management',
    changePassword:'Change Password', currentPassword:'Current Password',
    newPassword:'New Password', passwordChanged:'Password changed successfully',
    lightMode:'Light', darkMode:'Dark', systemMode:'System',
    trialDays:'days free trial', trialExpired:'Trial expired',
  },
}

export function t(key, lang) {
  const l = lang || (typeof localStorage !== 'undefined' ? localStorage.getItem('erp-lang') : null) || 'ar'
  return T[l]?.[key] ?? T.ar?.[key] ?? key
}

export function dir(lang) {
  return LANGS[lang || 'ar']?.dir || 'rtl'
}

export function locale(lang) {
  return LANGS[lang || 'ar']?.locale || 'ar-SA'
}
