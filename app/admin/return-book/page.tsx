import ReturnBookForm from '@/components/ReturnBookForm';

export default function ReturnBookPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Return Book</h1>
        <p className="text-gray-600 mt-2">Process book returns and calculate fines</p>
      </div>
      <ReturnBookForm />
    </div>
  );
}
