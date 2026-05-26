import IssueBookForm from '@/components/IssueBookForm';

export default function IssueBookPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Issue Book to Member</h1>
        <p className="text-gray-600 mt-2">Fill out the form below to issue a book to a registered member.</p>
      </div>
      <IssueBookForm />
    </div>
  );
}
