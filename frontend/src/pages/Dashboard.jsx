import { Link } from 'react-router-dom';
import { Package, CreditCard, TrendingUp } from 'lucide-react';

const Dashboard = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Store Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/inventory" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                            <Package size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">Inventory</h3>
                            <p className="text-gray-500">Manage products & stock</p>
                        </div>
                    </div>
                </Link>

                <Link to="/udhaar" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center space-x-4">
                        <div className="bg-red-100 p-3 rounded-full text-red-600">
                            <CreditCard size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">Udhaar / Credit</h3>
                            <p className="text-gray-500">Track customer credits</p>
                        </div>
                    </div>
                </Link>

                <Link to="/order-management" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-3 rounded-full text-green-600">
                            <TrendingUp size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">Sales</h3>
                            <p className="text-gray-500">View recent orders</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;
