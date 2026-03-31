import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../layout/AppLayout';
import Spinner from '../common/Spinner';


const ProtectedRoute = () => {
    const {isAuthenticated,loading} = useAuth();
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner />
            </div>
        );
    } 
    return  isAuthenticated ?(
    <AppLayout>
        <Outlet />
    </AppLayout>
    ) : (
        <Navigate to="/login" replace />
    );
  
};

export default ProtectedRoute;