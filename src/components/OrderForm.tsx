import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { OrderSchema } from '../lib/supabase';
import { PlusCircle } from 'lucide-react';

const PAYMENT_TERMS = ['T/T', 'DA', 'DP', 'LC', 'LC/T/T'] as const;

export default function OrderForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    company_name: '',
    pi_number: '',
    etd: '',
    eta: '',
    payment_terms: 'T/T' as typeof PAYMENT_TERMS[number],
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!user) throw new Error('User not authenticated');
      
      const validatedData = OrderSchema.parse(formData);
      
      const { error } = await supabase
        .from('orders')
        .insert([{ ...validatedData, user_id: user.id }]);
        
      if (error) throw error;
      
      setFormData({
        company_name: '',
        pi_number: '',
        etd: '',
        eta: '',
        payment_terms: 'T/T',
      });
      
      setMessage({ type: 'success', text: 'Order created successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to create order' });
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Order</h2>
      
      {message.text && (
        <div
          className={`mb-4 p-4 rounded ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.company_name}
              onChange={(e) =>
                setFormData({ ...formData, company_name: e.target.value })
              }
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              P/I Number
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.pi_number}
              onChange={(e) =>
                setFormData({ ...formData, pi_number: e.target.value })
              }
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              ETD
            </label>
            <input
              type="date"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.etd}
              onChange={(e) => setFormData({ ...formData, etd: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              ETA
            </label>
            <input
              type="date"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.eta}
              onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment Terms
            </label>
            <select
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.payment_terms}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  payment_terms: e.target.value as typeof PAYMENT_TERMS[number],
                })
              }
            >
              {PAYMENT_TERMS.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Create Order
          </button>
        </div>
      </form>
    </div>
  );
}
