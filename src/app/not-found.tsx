import Link from 'next/link';
import { Button, Card, CardContent } from '@/components/ui';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Card variant="bordered" className="max-w-md w-full shadow-xl border-t-4 border-t-blue-600">
        <CardContent className="p-8 text-center flex flex-col items-center gap-6">
            <div className="rounded-full bg-blue-50 p-4">
            <FileQuestion className="h-12 w-12 text-blue-600" />
            </div>
            
            <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">404</h1>
            <h2 className="text-xl font-semibold text-gray-700">הדף לא נמצא</h2>
            </div>
            
            <p className="text-gray-500 text-center" dir="rtl">
            מצטערים, הדף שחיפשת אינו קיים או שהוסר.
            <br />
            אנא בדוק את הכתובת או חזור לדף הבית.
            </p>

            <div className="flex gap-4 w-full justify-center pt-2">
                <Link href="/" passHref>
                    <Button>
                    חזרה לדף הבית
                    </Button>
                </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
