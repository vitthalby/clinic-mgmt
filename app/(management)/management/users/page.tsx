export default function UsersPage() {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                    Add User
                </button>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
                <p className="text-gray-500">List of authorized staff will appear here.</p>
            </div>
        </div>
    )
}
