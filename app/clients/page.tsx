"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [spaces, setSpaces] = useState([]);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const { data, error } = await supabase.from("clients").select("*");
    
    if (data) {
      setClients(data);
    }
  };

  const handleClientClick = async (client: any) => {
    setSelectedClient(client);

    const { data, error } = await supabase
      .from("space_clients")
      .select(`
        spaces (
          id,
          address
        )
      `)
      .eq("client_id", client.id);

    if (data) {
      setSpaces(data);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 p-8 gap-8 font-sans">
      
      {/* Left Column: Clients */}
      <div className="w-1/3 bg-white p-6 rounded shadow border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Clients</h2>
        <div className="flex flex-col gap-2">
          {clients.map((client: any) => (
            <button
              key={client.id}
              onClick={() => handleClientClick(client)}
              className="text-left px-4 py-3 bg-gray-100 hover:bg-blue-100 rounded transition-colors text-gray-700 font-medium"
            >
              {client.name}
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Connected Spaces */}
      <div className="w-2/3 bg-white p-6 rounded shadow border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {selectedClient ? `${selectedClient.name}'s Spaces` : "Select a Client"}
        </h2>
        
        <div className="flex flex-col gap-3">
          {selectedClient && spaces.length === 0 && (
            <p className="text-gray-500">This client has no connected spaces.</p>
          )}

          {spaces.map((row: any, index: number) => {
            // Because we queried the join table, the data is nested inside 'spaces'
            const space = row.spaces;
            
            if (!space) return null;

            return (
              <div 
                key={space.id || index} 
                className="p-4 border border-gray-200 rounded bg-gray-50 text-gray-700"
              >
                {space.address}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
