import React from 'react';
import { useNavigate } from 'react-router-dom';

const adminPages = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Orders', path: '/admin/orders' },
    { label: 'Products', path: '/admin/products' },
    { label: 'Sales', path: '/admin/sales' },
    { label: 'Users', path: '/admin/users' },
];

function AdminAppBarComponent() {
    const navigate = useNavigate();

    return (
        <nav style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {adminPages.map((page) => (
                <button
                    key={page.path}
                    type="button"
                    onClick={() => navigate(page.path)}
                >
                    {page.label}
                </button>
            ))}
        </nav>
    );
}

export {AdminAppBarComponent};