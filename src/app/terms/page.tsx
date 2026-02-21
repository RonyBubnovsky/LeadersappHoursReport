import Link from 'next/link'
import { Card, CardContent } from '@/components/ui'
import { Shield, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'תנאי שימוש ומדיניות פרטיות | דיווח שעות LeadersApp',
  description: 'תנאי שימוש ומדיניות פרטיות של אתר דיווח שעות LeadersApp',
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3 pb-2 border-b border-gray-200">
      {children}
    </h2>
  )
}

function SubSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      {title && <h3 className="text-base font-semibold text-gray-800 mb-2">{title}</h3>}
      <div className="text-gray-600 text-sm leading-relaxed space-y-2">{children}</div>
    </div>
  )
}

export default function TermsPage() {
  const lastUpdated = '21 בפברואר 2026'

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            תנאי שימוש ומדיניות פרטיות
          </h1>
          <p className="text-gray-500 text-sm">עודכן לאחרונה: {lastUpdated}</p>
        </div>

        <Card variant="bordered" className="shadow-sm">
          <CardContent className="p-6 md:p-10">
            {/* 1. מבוא */}
            <SectionTitle>1. מבוא</SectionTitle>
            <SubSection>
              <p>
                ברוכים הבאים לאתר <strong>דיווח שעות LeadersApp</strong> (להלן: &quot;האתר&quot; או &quot;השירות&quot;),
                הזמין בכתובת{' '}
                <a
                  href="https://www.leaders-app-hours-report.club"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  www.leaders-app-hours-report.club
                </a>
                .
              </p>
              <p>
                השירות מאפשר למשתמשים לנהל ולדווח שעות עבודה באופן מקוון.
                מסמך זה מפרט את תנאי השימוש באתר ואת מדיניות הפרטיות שלנו,
                כולל אופן איסוף, שימוש, אחסון והגנה על המידע האישי שלך.
              </p>
              <p>
                השימוש באתר מהווה הסכמה לתנאים אלה. אם אינך מסכים לתנאים, אנא הימנע משימוש באתר.
              </p>
            </SubSection>

            {/* 2. הגדרות */}
            <SectionTitle>2. הגדרות</SectionTitle>
            <SubSection>
              <ul className="list-disc list-inside space-y-1 mr-2">
                <li><strong>&quot;משתמש&quot;</strong> - כל אדם הנכנס לאתר או הנרשם לשירות.</li>
                <li><strong>&quot;מידע אישי&quot;</strong> - מידע המזהה אותך באופן אישי, כגון כתובת אימייל.</li>
                <li><strong>&quot;תוכן משתמש&quot;</strong> - כל המידע שאתה מזין לשירות, כולל נתוני שעות עבודה, שמות גיליונות ורשומות.</li>
                <li><strong>&quot;עוגיות (Cookies)&quot;</strong> - קבצי טקסט קטנים הנשמרים על המכשיר שלך לצורך תפעול השירות.</li>
              </ul>
            </SubSection>

            {/* 3. איסוף מידע */}
            <SectionTitle>3. איסוף מידע</SectionTitle>
            <SubSection title="3.1 מידע שאתה מספק לנו">
              <ul className="list-disc list-inside space-y-1 mr-2">
                <li>כתובת אימייל - בעת הרשמה לשירות.</li>
                <li>סיסמה - מוצפנת ומאוחסנת באופן מאובטח (במקרה של הרשמה באימייל).</li>
                <li>נתוני שעות עבודה - רשומות שעות, שמות גיליונות, ומידע נלווה שאתה מזין.</li>
              </ul>
            </SubSection>
            <SubSection title="3.2 מידע שנאסף אוטומטית">
              <p>
                איננו אוספים מידע אנליטי, מידע מיקום או נתוני גלישה.
                המידע היחיד הנאסף אוטומטית הוא מידע טכני הכרחי לתפעול השירות
                (כגון כתובת IP לצורכי אבטחה בתהליך ההתחברות).
              </p>
            </SubSection>

            {/* 4. שימוש במידע */}
            <SectionTitle>4. שימוש במידע</SectionTitle>
            <SubSection>
              <p>אנו משתמשים במידע שלך אך ורק למטרות הבאות:</p>
              <ul className="list-disc list-inside space-y-1 mr-2">
                <li>הפעלה ותחזוקה של השירות.</li>
                <li>אימות זהותך והתחברות לחשבון.</li>
                <li>שמירה והצגה של נתוני שעות העבודה שלך.</li>
                <li>תקשורת עמך בנוגע לחשבונך (למשל, אימות אימייל, איפוס סיסמה).</li>
              </ul>
              <p className="mt-2 font-medium text-gray-700">
                איננו משתמשים במידע שלך לשיווק, פרסום או כל מטרה שאינה קשורה ישירות לתפעול השירות.
              </p>
            </SubSection>

            {/* 5. אחסון מידע */}
            <SectionTitle>5. אחסון מידע</SectionTitle>
            <SubSection>
              <ul className="list-disc list-inside space-y-1 mr-2">
                <li>
                  כל המידע מאוחסן על שרתי <strong>Supabase</strong> בענן, תוך שימוש בהצפנה
                  מתקדמת הן בזמן העברת הנתונים (encryption in transit) והן בזמן האחסון (encryption at rest).
                </li>
                <li>
                  המידע שלך נשמר כל עוד החשבון שלך פעיל, או עד שתבקש למחוק אותו.
                </li>
                <li>
                  לאחר מחיקת חשבון, כל המידע האישי ותוכן המשתמש יימחקו אוטומטית
                  מהמערכת, בכפוף לדרישות חוקיות לשמירת מידע (אם קיימות).
                </li>
              </ul>
            </SubSection>

            {/* 6. עוגיות */}
            <SectionTitle>6. עוגיות (Cookies)</SectionTitle>
            <SubSection>
              <p>
                האתר משתמש <strong>אך ורק בעוגיות הכרחיות</strong> הנדרשות לתפעול השירות:
              </p>
              <ul className="list-disc list-inside space-y-1 mr-2 mt-2">
                <li><strong>עוגיות אימות (Authentication Cookies)</strong> - לשמירת מצב ההתחברות שלך.</li>
                <li><strong>עוגיות סשן (Session Cookies)</strong> - לניהול הפגישה הפעילה שלך באתר.</li>
              </ul>
              <p className="mt-2">
                איננו משתמשים בעוגיות מעקב, עוגיות פרסום, או עוגיות של צדדים שלישיים.
                העוגיות ההכרחיות נמחקות אוטומטית עם סגירת הדפדפן או בעת התנתקות מהשירות.
              </p>
            </SubSection>

            {/* 7. אבטחת מידע */}
            <SectionTitle>7. אבטחת מידע</SectionTitle>
            <SubSection>
              <p>אנו נוקטים באמצעי אבטחה מתקדמים להגנה על המידע שלך:</p>
              <ul className="list-disc list-inside space-y-1 mr-2">
                <li>הצפנת נתונים בזמן העברה (TLS/SSL) ובזמן אחסון.</li>
                <li>שימוש בפלטפורמת Supabase המספקת אבטחה ברמה ארגונית.</li>
                <li>הצפנת סיסמאות באמצעות אלגוריתמים חזקים (bcrypt).</li>
                <li>בקרת גישה מבוססת Row-Level Security (RLS) ברמת בסיס הנתונים.</li>
                <li>גישה מאובטחת דרך HTTPS בלבד.</li>
              </ul>
              <p className="mt-2">
                חרף מאמצינו, אין שיטת אחסון או העברה דיגיטלית שהיא בטוחה ב-100%.
                אנו מתחייבים לעדכן ולשפר את אמצעי האבטחה שלנו באופן שוטף.
              </p>
            </SubSection>

            {/* 8. זכויות המשתמש */}
            <SectionTitle>8. זכויות המשתמש</SectionTitle>
            <SubSection>
              <p>
                בהתאם לחוק הגנת הפרטיות הישראלי, תקנות GDPR האירופאיות, ושיטות עבודה
                מומלצות לשנת 2026, עומדות לך הזכויות הבאות:
              </p>
              <ul className="list-disc list-inside space-y-1 mr-2 mt-2">
                <li><strong>זכות גישה</strong> - לעיין במידע האישי שלך המאוחסן אצלנו.</li>
                <li><strong>זכות תיקון</strong> - לתקן מידע שגוי או לא מדויק.</li>
                <li><strong>זכות מחיקה (&quot;הזכות להישכח&quot;)</strong> - לבקש מחיקת כל המידע האישי שלך.</li>
                <li><strong>זכות ניידות</strong> - לקבל את המידע שלך בפורמט מובנה (ייצוא לאקסל).</li>
                <li><strong>זכות הגבלת עיבוד</strong> - לבקש הגבלת השימוש במידע שלך.</li>
                <li><strong>זכות התנגדות</strong> - להתנגד לעיבוד המידע שלך.</li>
              </ul>
              <p className="mt-2">
                לצורך מימוש זכויותיך, ניתן לפנות אלינו בכתובת{' '}
                <a href="mailto:support@leaders-app-hours-report.club" className="text-blue-600 hover:underline">
                  support@leaders-app-hours-report.club
                </a>
                . נשתדל לטפל בפנייתך תוך 30 ימים.
              </p>
            </SubSection>

            {/* 9. שיתוף מידע */}
            <SectionTitle>9. שיתוף מידע עם צדדים שלישיים</SectionTitle>
            <SubSection>
              <p>
                <strong>איננו מוכרים, משכירים או משתפים את המידע האישי שלך</strong> עם צדדים שלישיים
                למטרות שיווקיות או מסחריות.
              </p>
              <p>המידע שלך עשוי להיות משותף אך ורק במקרים הבאים:</p>
              <ul className="list-disc list-inside space-y-1 mr-2 mt-1">
                <li>
                  <strong>ספקי שירות</strong> - Supabase (אחסון ואימות), Google (התחברות דרך Google OAuth)
                  - אך ורק במידה הנדרשת לתפעול השירות.
                </li>
                <li>
                  <strong>דרישה חוקית</strong> - אם נידרש לכך על פי חוק, צו בית משפט או הליך משפטי.
                </li>
              </ul>
            </SubSection>

            {/* 10. גיל מינימלי */}
            <SectionTitle>10. גיל מינימלי לשימוש</SectionTitle>
            <SubSection>
              <p>
                השירות מיועד למשתמשים בני 16 ומעלה. איננו אוספים ביודעין מידע אישי
                מילדים מתחת לגיל 16. אם נודע לנו כי נאסף מידע ממשתמש מתחת לגיל זה,
                נמחק אותו באופן מיידי.
              </p>
            </SubSection>

            {/* 11. קניין רוחני */}
            <SectionTitle>11. קניין רוחני</SectionTitle>
            <SubSection>
              <p>
                כל הזכויות בשירות, לרבות עיצוב, קוד, לוגו וסימני מסחר, שמורות למפעיל האתר.
                אין להעתיק, לשכפל או להפיץ חלקים מהאתר ללא אישור מראש.
              </p>
              <p>
                תוכן המשתמש (נתוני שעות העבודה) נשאר בבעלותך המלאה.
                אנו לא טוענים לבעלות על התוכן שאתה מזין לשירות.
              </p>
            </SubSection>

            {/* 12. הגבלת אחריות */}
            <SectionTitle>12. הגבלת אחריות</SectionTitle>
            <SubSection>
              <p>
                השירות מסופק &quot;כמות שהוא&quot; (AS IS). אנו עושים כמיטב יכולתנו לספק שירות
                אמין ורציף, אך איננו מתחייבים לזמינות מלאה של השירות בכל עת.
              </p>
              <p>
                לא נישא באחריות לנזקים ישירים או עקיפים הנובעים משימוש או חוסר יכולת
                להשתמש בשירות, כולל אובדן נתונים.
              </p>
            </SubSection>

            {/* 13. שינויים */}
            <SectionTitle>13. שינויים בתנאי השימוש</SectionTitle>
            <SubSection>
              <p>
                אנו שומרים לעצמנו את הזכות לעדכן תנאים אלה מעת לעת.
                שינויים מהותיים יפורסמו באתר ויעודכן תאריך העדכון האחרון בראש מסמך זה.
              </p>
              <p>
                המשך השימוש באתר לאחר עדכון התנאים מהווה הסכמה לתנאים המעודכנים.
              </p>
            </SubSection>

            {/* 14. הדין החל */}
            <SectionTitle>14. הדין החל וסמכות שיפוט</SectionTitle>
            <SubSection>
              <p>
                תנאים אלה כפופים לדין הישראלי. כל מחלוקת הנובעת מהשימוש בשירות
                תהיה בסמכות השיפוט הבלעדית של בתי המשפט המוסמכים בישראל.
              </p>
            </SubSection>

            {/* 15. יצירת קשר */}
            <SectionTitle>15. יצירת קשר</SectionTitle>
            <SubSection>
              <p>לכל שאלה, בקשה או תלונה בנוגע לתנאי שימוש אלה או למדיניות הפרטיות, ניתן לפנות אלינו:</p>
              <div className="mt-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="font-medium text-gray-800">דיווח שעות LeadersApp</p>
                <p className="mt-1">
                  אימייל:{' '}
                  <a href="mailto:support@leaders-app-hours-report.club" className="text-blue-600 hover:underline">
                    support@leaders-app-hours-report.club
                  </a>
                </p>
              </div>
            </SubSection>

            {/* Back link */}
            <div className="mt-10 pt-6 border-t border-gray-200 flex flex-wrap gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                חזרה לדף ההתחברות
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                חזרה לדף הבית
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
