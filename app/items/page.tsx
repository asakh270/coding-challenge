'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Person = {
    id: string;
    name: string;
};

type Item = {
    id: string;
    name: string;
    created_at: string;
    is_completed: boolean;
    person_id: string;
};

export default function ItemsPage() {
    const [people, setPeople] = useState<Person[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            setLoading(true);
            const [peopleRes, itemsRes] = await Promise.all([
                supabase.from('people').select('*').order('id', { ascending: true }),
                supabase.from('items').select('*').order('created_at', { ascending: false })
            ]);

            if (peopleRes.error) throw peopleRes.error;
            if (itemsRes.error) throw itemsRes.error;

            setPeople(peopleRes.data || []);
            setItems(itemsRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
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
        <div className="min-h-screen bg-neutral-50 text-neutral-900 p-8 md:p-12 lg:p-16 selection:bg-emerald-500/30">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent mb-4 pb-2">
                        Family Grocery Lists
                    </h1>
                    <p className="text-neutral-500 text-lg">Keep track of shopping needs for everyone.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                    </div>
                ) : people.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-2xl border border-neutral-200 shadow-sm">
                        <h3 className="text-xl font-bold text-neutral-800 mb-2">No people found</h3>
                        <p className="text-neutral-500">Please add Aaron, Ben, and Charlie to your "people" table first!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {people.map(person => (
                            <GroceryColumn 
                                key={person.id}
                                person={person} 
                                items={items.filter(i => i.person_id === person.id)} 
                                setItems={setItems} 
                                allItems={items}
                                toggleComplete={toggleComplete}
                                deleteItem={deleteItem}
                            />
                        ))}
                    </div>
                )}
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

function GroceryColumn({ 
    person, 
    items, 
    setItems, 
    allItems,
    toggleComplete, 
    deleteItem
}: { 
    person: Person;
    items: Item[];
    setItems: any;
    allItems: Item[];
    toggleComplete: (id: string, status: boolean) => void;
    deleteItem: (id: string) => void;
}) {
    const [newItemName, setNewItemName] = useState('');

    async function addItem(e: React.FormEvent) {
        e.preventDefault();
        if (!newItemName.trim()) return;

        try {
            const { data, error } = await supabase
                .from('items')
                .insert([{ name: newItemName.trim(), is_completed: false, person_id: person.id }])
                .select();

            if (error) throw error;
            if (data) setItems([data[0], ...allItems]);
            setNewItemName('');
        } catch (error) {
            console.error('Error adding item:', error);
        }
    }

    return (
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm flex flex-col h-[600px]">
            {/* Header Section */}
            <div className="p-6 border-b border-neutral-200 bg-gradient-to-b from-white to-neutral-50">
                <h2 className="text-2xl font-bold text-neutral-800">
                    {person.name}'s List
                </h2>
            </div>

            {/* Input Section */}
            <div className="p-5 pb-2">
                <form onSubmit={addItem} className="flex gap-2">
                    <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Add item..."
                        className="flex-1 bg-white border border-neutral-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-neutral-400 text-neutral-900 shadow-sm text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!newItemName.trim()}
                        className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors duration-200 shadow-md shadow-emerald-500/20 active:scale-95 text-sm"
                    >
                        Add
                    </button>
                </form>
            </div>

            {/* List Section */}
            <div className="p-5 pt-3 flex-1 overflow-y-auto custom-scrollbar">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-neutral-400 space-y-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-sm">List is empty</p>
                    </div>
                ) : (
                    <ul className="space-y-2.5">
                        {items.map(item => (
                            <li
                                key={item.id}
                                className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${item.is_completed
                                        ? 'bg-neutral-50 border-neutral-200'
                                        : 'bg-white border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 shadow-sm'
                                    }`}
                            >
                                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                    <button
                                        onClick={() => toggleComplete(item.id, item.is_completed)}
                                        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${item.is_completed
                                                ? 'bg-emerald-500 border-emerald-500'
                                                : 'border-neutral-300 bg-white hover:border-emerald-400'
                                            }`}
                                    >
                                        {item.is_completed && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                    <span
                                        className={`truncate text-sm transition-all duration-300 ${item.is_completed ? 'text-neutral-400 line-through' : 'text-neutral-700 font-medium'
                                            }`}
                                    >
                                        {item.name}
                                    </span>
                                </div>

                                <button
                                    onClick={() => deleteItem(item.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all focus:opacity-100"
                                    aria-label="Delete item"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
