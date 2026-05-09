import React from 'react'

const SearchResults = ({ searchTerm, results }) => {
  if (!searchTerm || results.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Search Results for "{searchTerm}" ({results.length})
      </h3>
      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
            <h4 className="font-medium text-gray-900 mb-2">{result.question}</h4>
            <p className="text-gray-600 text-sm mb-2">{result.answer.substring(0, 150)}...</p>
            <span className="text-xs text-blue-600 font-medium">{result.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;