"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const SearchBar = ({ isPaginated = true }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    setLoading(true);
    const params = new URLSearchParams(window.location.search);
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    // Reset page ke 1 saat search berubah
    if (isPaginated) {
      params.set("page", "1");
    }

    router.replace(`${window.location.pathname}?${params.toString()}`);
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex max-w-lg w-full">
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyPress}
        className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSearch}
        className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition"
      >
        Search
      </button>
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          Loading...
        </div>
      )}
    </div>
  );
};
