import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Home, RotateCw } from 'lucide-react';

export default function LibraryHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Library Management System</h1>
          <p className="text-xl text-gray-600">
            Efficient book management with real-time tracking and member management
          </p>
        </div>

        {/* Admin Navigation */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/admin/dashboard">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-blue-600" />
                    Dashboard
                  </CardTitle>
                  <CardDescription>View system overview and statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Go to Dashboard</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/members">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    Members
                  </CardTitle>
                  <CardDescription>Manage member profiles and status</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Manage Members</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/books">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    Books
                  </CardTitle>
                  <CardDescription>Add and manage book catalog</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Manage Books</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/issue-book">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-orange-600" />
                    Issue Book
                  </CardTitle>
                  <CardDescription>Issue book to members</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Issue Book</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/return-book">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RotateCw className="w-5 h-5 text-red-600" />
                    Return Book
                  </CardTitle>
                  <CardDescription>Process book returns</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Return Book</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/transactions">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    Transactions
                  </CardTitle>
                  <CardDescription>View transaction history</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">View Transactions</Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* How to Use */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Start Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg text-gray-800 mb-3">To Issue a Book:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Go to Issue Book page</li>
                <li>Select a member</li>
                <li>Select a book to issue</li>
                <li>System validates all conditions</li>
                <li>Get transaction ID and due date</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-800 mb-3">To Return a Book:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Go to Return Book page</li>
                <li>Select transaction to process</li>
                <li>System calculates fine if overdue</li>
                <li>Book availability is restored</li>
                <li>Transaction status updated</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
