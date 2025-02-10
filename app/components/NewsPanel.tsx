import type React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, ExternalLink, AlertCircle } from "lucide-react";
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
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-[5%] right-0 m-4 sm:left-auto h-[calc(100%-6rem)] w-[calc(100%-2rem)] sm:w-[440px] bg-white text-black overflow-y-auto shadow-2xl z-10 rounded-2xl"
      >
        <div className="p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold"
            >
              News from {country}
            </motion.h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </motion.button>
          </div>

          {isLoading && (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="animate-pulse"
                >
                  <div className="h-48 bg-gray-300 rounded-lg mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </motion.div>
              ))}
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 * 0.1 }}
              className="flex flex-col items-center justify-center text-center p-8"
            >
              <AlertCircle size={48} className="text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">{error}</p>
            </motion.div>
          )}

          {!isLoading && !error && news.length > 0 && (
            <motion.ul className="space-y-6">
              {news.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-gray-200 pb-6"
                >
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:bg-gray-50 transition duration-150 ease-in-out rounded-lg p-4"
                  >
                    {item.image && (
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-48 object-cover mb-4 rounded-lg shadow-md"
                      />
                    )}
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 mb-2 line-clamp-3">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock size={16} className="mr-1" />
                        {item.age}
                      </span>
                      <span className="flex items-center text-blue-500 hover:text-blue-600">
                        Read more
                        <ExternalLink size={16} className="ml-1" />
                      </span>
                    </div>
                  </a>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewsPanel;
