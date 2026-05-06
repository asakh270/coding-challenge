"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function SpacesPage() {
  const [spaces, setSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    const { data, error } = await supabase.from("spaces").select("*");
    
    if (data) {
      setSpaces(data);
    }
  };

  const handleSpaceClick = async (space: any) => {
    setSelectedSpace(space);

    const { data, error } = await supabase
      .from("space_clients")
      .select(`
        clients (
          id,
          name
        )
      `)
      .eq("space_id", space.id);

    if (data) {
      setClients(data);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 p-8 gap-8 font-sans">
      
      {/* Left Column: Spaces */}
      <div className="w-1/3 bg-white p-6 rounded shadow border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Spaces</h2>
        <div className="flex flex-col gap-2">
          {spaces.map((space: any) => (
            <button
              key={space.id}
              onClick={() => handleSpaceClick(space)}
              className={`text-left px-4 py-3 rounded transition-colors ${
                selectedSpace?.id === space.id 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-100 hover:bg-blue-100 text-gray-700 font-medium"
              }`}
            >
              {space.address}
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Connected Clients */}
      <div className="w-2/3 bg-white p-6 rounded shadow border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {selectedSpace ? `Clients at ${selectedSpace.address}` : "Select a Space"}
        </h2>
        
        <div className="flex flex-col gap-3">
          {selectedSpace && clients.length === 0 && (
            <p className="text-gray-500">This space has no connected clients.</p>
          )}

          {clients.map((row: any, index: number) => {
            // Because we queried the join table, the data is nested inside 'clients'
            const client = row.clients;
            
            if (!client) return null;

            return (
              <div 
                key={client.id || index} 
                className="p-4 border border-gray-200 rounded bg-gray-50 text-gray-700 font-medium"
              >
                {client.name}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
