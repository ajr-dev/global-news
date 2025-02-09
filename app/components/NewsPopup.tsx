import type { News } from "../hooks/useNews"

interface NewsPopupProps {
  country: string
  news: News[]
  isLoading: boolean
  error: string | null
  onClose: () => void
}

export default function NewsPopup({ country, news, isLoading, error, onClose }: NewsPopupProps) {
  return (
    <div className="bg-white text-black p-4 rounded-lg shadow-lg max-w-md max-h-96 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Top News in {country}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          &times;
        </button>
      </div>
      {isLoading && <p>Loading news...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {news.length > 0 && (
        <ul className="space-y-2">
          {news.map((item, index) => (
            <li key={index} className="border-b pb-2">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}