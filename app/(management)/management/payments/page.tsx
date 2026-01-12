export default function PaymentsPage() {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                    Record Payment
                </button>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
                <p className="text-gray-500">Payment history will appear here.</p>
            </div>
        </div>
    )
}
