'use client';

import { useState, useEffect } from 'react';
import { memberAPI } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface Member {
  _id: string;
  memberId: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  maxBorrowLimit: number;
}

export default function MemberManagement() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    memberId: '',
    name: '',
    email: '',
    phone: '',
    maxBorrowLimit: 5,
  });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await memberAPI.getAll();
      setMembers(response.data.data || []);
    } catch (err) {
      setError('Failed to load members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await memberAPI.create(formData);
      setSuccess('Member created successfully!');
      setFormData({ memberId: '', name: '', email: '', phone: '', maxBorrowLimit: 5 });
      setShowForm(false);
      loadMembers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create member');
    }
  };

  const handleStatusChange = async (memberId: string, newStatus: string) => {
    try {
      await memberAPI.updateMemberStatus(memberId, newStatus);
      setSuccess('Member status updated!');
      loadMembers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading members...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Member Management</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add New Member'}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded text-green-700">
          <CheckCircle2 className="w-4 h-4" />
          {success}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Member ID</label>
                <input
                  type="text"
                  value={formData.memberId}
                  onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., MEM001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Borrow Limit</label>
                <input
                  type="number"
                  value={formData.maxBorrowLimit}
                  onChange={(e) => setFormData({ ...formData, maxBorrowLimit: parseInt(e.target.value) })}
                  min="1"
                  max="20"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <Button type="submit" className="w-full">
                Create Member
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Members List</CardTitle>
          <CardDescription>Total members: {members.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-2">Member ID</th>
                  <th className="text-left py-2 px-2">Name</th>
                  <th className="text-left py-2 px-2">Email</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">Limit</th>
                  <th className="text-left py-2 px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member._id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2 font-medium">{member.memberId}</td>
                    <td className="py-2 px-2">{member.name}</td>
                    <td className="py-2 px-2 text-gray-600">{member.email}</td>
                    <td className="py-2 px-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          member.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="py-2 px-2">{member.maxBorrowLimit}</td>
                    <td className="py-2 px-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleStatusChange(
                            member.memberId,
                            member.status === 'Active' ? 'Inactive' : 'Active'
                          )
                        }
                      >
                        {member.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
