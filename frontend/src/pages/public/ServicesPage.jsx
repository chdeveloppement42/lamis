
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPublishedListings } from '../../api/listings.api';
import { getCategories } from '../../api/categories.api';
import ListingCard from '../../components/ListingCard';
import LocationSelector from '../../components/LocationSelector';
import { Filter, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'; // Ajout de flèches
import AOS from 'aos';
import 'aos/dist/aos.css';
import './ServicesPage.css';

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    categoryId: searchParams.get('categoryId') || '',
    wilaya: searchParams.get('wilaya') || '',
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  });

  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const ITEMS_PER_PAGE = 9;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    // On passe page et limit à l'API
    getPublishedListings({ ...filters, page, limit: ITEMS_PER_PAGE })
      .then((data) => {
        setListings(data.data || []);
        setTotalCount(data.meta?.total || 0);
        // Scroll en haut de la liste quand on change de page
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .finally(() => setLoading(false));
  }, [filters, page]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setSearchParams(filters);
    setPage(1); // Reset à la page 1 lors d'une nouvelle recherche
    setIsFilterOpen(false);
  };

  return (
    <div className="aymen-services-wrapper">
      <section className="hero-services">
        <div 
          className="hero-background-blur" 
          style={{ backgroundImage: `url('/services.png')` }} 
        />
        <div className="hero-overlay" />
        
        <div className="container hero-content-services" data-aos="zoom-out">
          <p className="cursive-accent">Immo Lamis</p>
          <h1 className="massive-title">NOS ANNONCES</h1>
        </div>
      </section>

      <div className="container services-layout">
        <aside className={`filters-sidebar ${isFilterOpen ? 'open' : ''}`}>
          <form onSubmit={handleApplyFilters} className="filters-form-luxe">
            <h3 className="filter-title-luxe">RECHERCHE AVANCÉE</h3>
            
            <div className="filter-group-luxe">
              <label>TRANSACTION</label>
              <select 
                className="select-luxe-native"
                value={filters.type} 
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">Toutes</option>
                <option value="VENTE">Vente</option>
                <option value="LOCATION">Location</option>
              </select>
            </div>

            <div className="filter-group-luxe">
              <label>CATÉGORIE</label>
              <select 
                className="select-luxe-native"
                value={filters.categoryId} 
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              >
                <option value="">Toutes les catégories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <LocationSelector
              wilaya={filters.wilaya}
              onWilayaChange={(val) => handleFilterChange('wilaya', val)}
            />

            <div className="filter-group-luxe mt-3">
              <label>PRIX MINIMUM (DA)</label>
              <input 
                type="number" 
                className="input-luxe-native"
                placeholder="Ex: 100000"
                value={filters.minPrice} 
                onChange={(e) => handleFilterChange('minPrice', e.target.value)} 
              />
            </div>

            <div className="filter-group-luxe mt-3">
              <label>PRIX MAXIMUM (DA)</label>
              <input 
                type="number" 
                className="input-luxe-native"
                placeholder="Ex: 50000000"
                value={filters.maxPrice} 
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)} 
              />
            </div>

            <button type="submit" className="btn-aymen-gold w-100 mt-4">RECHERCHER</button>
          </form>
        </aside>

        <main className="results-main">
          {loading ? (
            <div className="loader-aymen-container"><Loader2 className="spinner-gold" size={40} /></div>
          ) : (
            <>
              <div className="listings-grid-aymen grid-3x3">
                {listings.length > 0 ? (
                  listings.map(l => <ListingCard key={l.id} listing={l} />)
                ) : (
                  <div className="no-results">Aucun bien ne correspond à vos critères.</div>
                )}
              </div>

              {/* --- PAGINATION PRESTIGE --- */}
              {totalPages > 1 && (
                <div className="pagination-container-luxe">
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(prev => prev - 1)}
                    className="pagination-arrow"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="pagination-numbers">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        className={`page-number ${page === i + 1 ? 'active' : ''}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button 
                    disabled={page === totalPages}
                    onClick={() => setPage(prev => prev + 1)}
                    className="pagination-arrow"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}