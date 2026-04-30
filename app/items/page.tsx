'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Item = {
    id: string;
    name: string;
    created_at: string;
    is_completed: boolean;
};

export default function ItemsPage() {
    const [items, setItems] = useState<Item[]>([]);
    const [newItemName, setNewItemName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchItems();
    }, []);

    async function fetchItems() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('items')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    }

    async function addItem(e: React.FormEvent) {
        e.preventDefault();
        if (!newItemName.trim()) return;

        try {
            const { data, error } = await supabase
                .from('items')
                .insert([{ name: newItemName.trim(), is_completed: false }])
                .select();

            if (error) throw error;
            if (data) setItems([data[0], ...items]);
            setNewItemName('');
        } catch (error) {
            console.error('Error adding item:', error);
        }
    }

    async function toggleComplete(id: string, currentStatus: boolean) {
        try {
            const { error } = await supabase
                .from('items')
                .update({ is_completed: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            setItems(items.map(item =>
                item.id === id ? { ...item, is_completed: !currentStatus } : item
            ));
        } catch (error) {
            console.error('Error toggling completion:', error);
        }
    }

    async function deleteItem(id: string) {
        try {
            const { error } = await supabase
                .from('items')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setItems(items.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    }

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 flex items-center justify-center p-4 selection:bg-emerald-500/30">
            <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">

                {/* Header Section */}
                <div className="p-8 border-b border-neutral-200 bg-gradient-to-b from-white to-neutral-50">
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent mb-2">
                        Grocery List
                    </h1>
                    <p className="text-neutral-500 text-sm">Keep track of your shopping needs.</p>
                </div>

                {/* Input Section */}
                <div className="p-6 pb-2">
                    <form onSubmit={addItem} className="flex gap-3">
                        <input
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder="What do you need?"
                            className="flex-1 bg-white border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-neutral-400 text-neutral-900 shadow-sm"
                        />
                        <button
                            type="submit"
                            disabled={!newItemName.trim()}
                            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white font-semibold px-5 py-3 rounded-xl transition-colors duration-200 shadow-lg shadow-emerald-500/20 active:scale-95"
                        >
                            Add
                        </button>
                    </form>
                </div>

                {/* List Section */}
                <div className="p-6 pt-4 h-[400px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center items-center h-full text-neutral-500">
                            <svg className="animate-spin h-8 w-8 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 space-y-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p>Your cart is empty!</p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {items.map(item => (
                                <li
                                    key={item.id}
                                    className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${item.is_completed
                                            ? 'bg-neutral-50 border-neutral-200'
                                            : 'bg-white border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 shadow-sm'
                                        }`}
                                >
                                    <div className="flex items-center gap-4 flex-1 overflow-hidden">
                                        <button
                                            onClick={() => toggleComplete(item.id, item.is_completed)}
                                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${item.is_completed
                                                    ? 'bg-emerald-500 border-emerald-500'
                                                    : 'border-neutral-300 bg-white hover:border-emerald-400'
                                                }`}
                                        >
                                            {item.is_completed && (
                                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                        <span
                                            className={`truncate transition-all duration-300 ${item.is_completed ? 'text-neutral-400 line-through' : 'text-neutral-700 font-medium'
                                                }`}
                                        >
                                            {item.name}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all focus:opacity-100"
                                        aria-label="Delete item"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Custom Scrollbar Styles for this page */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d4d4d8;
          border-radius: 20px;
        }
      `}} />
        </div>
    );
}
