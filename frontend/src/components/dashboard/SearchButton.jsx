import { Search } from 'lucide-react';

const SearchButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-blue-500"
      aria-label="Buscar"
    >
      <Search className="h-6 w-6" />
    </button>
  );
};

export default SearchButton;
