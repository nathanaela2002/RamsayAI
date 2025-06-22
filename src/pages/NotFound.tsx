import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';

const NotFound = () => {
  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">Oops! We couldn't find that recipe.</p>
        <Link 
          to="/"
          className="px-8 py-4 bg-cookify-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </Layout>
  );
};

export default NotFound;
