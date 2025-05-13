import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

export default function SearchResults() {
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [isMenuSearch, setIsMenuSearch] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get('term');

  useEffect(() => {
    const fetchResults = async () => {
      const token = localStorage.getItem('token');
      if (!token || !searchTerm) return;

      try {
        // مثال: نحدد نوع البحث حسب عنوان المستخدم الحالي أو خيالك
        const res = await axios.get(
          `https://localhost:7251/api/User/GetAllRestaurant?search=${searchTerm}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setResults(res.data);
        setIsMenuSearch(false);
        console.log("Search results from API:", res.data); // ✅ شوف هل بيرجع داتا؟
      setResults(res.data.items || []); // أو حسب الاستجابة
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    };

    fetchResults();
  }, [searchTerm]);

  return (
    <div className="container mt-5">
      <h3>🔍 Search Results for: <span className="text-primary">{searchTerm}</span></h3>
      <ul className="list-group mt-4">
        {results.length > 0 ? (
          results.map((item) => (
            <li className="list-group-item" key={item.restaurantID || item.menuItemID}>
              {isMenuSearch ? item.name : `${item.name} - ${item.location}`}
            </li>
          ))
        ) : (
          <p className="text-muted mt-3">No results found.</p>
        )}
      </ul>
    </div>
  );
}
