"use client";

import { useState } from "react";

type ShabbatResult = {
    candleLighting: string;
    havdalah: string;
};

export default function ShabbatTimesPage() {
    const [zipCode, setZipCode] = useState("");
    const [submittedZip, setSubmittedZip] = useState("");
    const [result, setResult] = useState<ShabbatResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!zipCode.trim()) return;

        setSubmittedZip(zipCode);
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = await fetch(`/api/shabbat?zip=${zipCode}`);
            if (!res.ok) {
                throw new Error("Failed to fetch Shabbat times");
            }

            const data = await res.json();
            setResult(data);
        } catch (err) {
            setError("Could not load Shabbat times. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-12 font-sans">
            <div className="bg-white p-8 rounded shadow-md border border-gray-200 w-full max-w-md">

                <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
                    Shabbat Times
                </h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8">
                    <div className="flex flex-col gap-2">
                        <label className="text-gray-700 font-medium">
                            Enter ZIP Code
                        </label>

                        <input
                            type="text"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            placeholder="e.g. 10001"
                            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        {loading ? "Loading..." : "Submit"}
                    </button>
                </form>

                {/* Error */}
                {error && (
                    <p className="text-red-500 mb-4 text-center">{error}</p>
                )}

                {/* Results */}
                {result && (
                    <div className="bg-gray-50 p-6 rounded border border-gray-200">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">
                            Results for {submittedZip}
                        </h2>

                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center bg-white p-3 rounded border border-gray-100 shadow-sm">
                                <span className="text-gray-600 font-medium">
                                    Candle Lighting Time
                                </span>
                                <span className="text-gray-900 font-bold text-lg">
                                    {result.candleLighting}
                                </span>
                            </div>

                            <div className="flex justify-between items-center bg-white p-3 rounded border border-gray-100 shadow-sm">
                                <span className="text-gray-600 font-medium">
                                    Havdalah Time
                                </span>
                                <span className="text-gray-900 font-bold text-lg">
                                    {result.havdalah}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}