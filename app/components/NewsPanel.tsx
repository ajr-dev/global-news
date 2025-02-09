import type React from "react";
import type { News } from "../hooks/useNews";

interface NewsPanelProps {
  country: string;
  news: News[];
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

const NewsPanel: React.FC<NewsPanelProps> = ({
  country,
  news,
  isLoading,
  error,
  onClose,
}) => {
  return (
    <div className="fixed top-1/2 right-4 transform -translate-y-1/2 rounded-xl left-4 sm:left-auto w-auto sm:w-[440px] max-h-[80vh] bg-white text-black overflow-y-auto transition-transform duration-300 ease-in-out z-10">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">News from {country}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 absolute top-4 right-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {isLoading && (
          <div className="space-y-4">
            {[...Array(17)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && news.length > 0 && (
          <ul className="space-y-4">
            {news.map((item, index) => (
              <li key={index} className="border-b pb-4">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:bg-gray-100 transition duration-150 ease-in-out"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-48 object-cover mb-2 rounded"
                    />
                  )}
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600 mb-2">{item.description}</p>
                  <p className="text-sm text-gray-400 mb-2">{item.age}</p>
                  <p className="text-blue-500">Click to read more...</p>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NewsPanel;
