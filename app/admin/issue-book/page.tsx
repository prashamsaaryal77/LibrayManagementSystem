import IssueBookForm from '@/components/IssueBookForm';

export default function IssueBookPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Issue Book to Member</h1>
        <p className="text-gray-600 mt-2">Implement the 16-step library algorithm</p>
      </div>
      <IssueBookForm />
    </div>
  );
}
