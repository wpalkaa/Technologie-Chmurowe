import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const Home = () => (
    <h2>Strona Główna</h2>
)

const Products = () => {
    const [ products, setProducts ] = useState([]);
    const [ newProduct, setNewProduct ] = useState('');
    
    const fetchProductsList = async () => {
        const response = await fetch("/api/items");

        if(response.ok) {
            const data = await response.json();
            setProducts(data);
        }
    }

    useEffect(() => {
        fetchProductsList();
    }, [])

    const addProduct = (e) => {
        e.preventDefault();

        fetch("/api/items", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item: newProduct })
        })
        .then(() => {
            setNewProduct('');
            fetchProductsList();
        });
    };

    return (
        <div>
            <h2>Lista Produktów</h2>
            <ul>
                {products.map(p => <li key={p}>{p}</li>)}
            </ul>
            <form onSubmit={addProduct}>
                <input 
                value={newProduct} 
                onChange={(e) => setNewProduct(e.target.value)} 
                placeholder="Nazwa nowego produktu" 
                required 
                />
                <button type="submit">Dodaj produkt</button>
            </form>
        </div>
    );
};


const Stats = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        // fetch("http://localhost:3010/stats")
        // .then(res => res.json())
        // .then(data => setStats(data));

        const fetchStats = async () => {
            try {
                const response = await fetch("/api/stats");

                if(response.ok) {
                    const data = await response.json();
                    console.log(data)
                    setStats(data);
                }
            } catch(error) {
                console.error("błąd fetch statystyk: ",error);
            }
        }

        fetchStats();
    }, []);

    return (
        <div>
            <h2>📊 Statystyki Systemu</h2>
            {stats ? (
                <ul>
                <li><strong>Produktów:</strong> {stats.products}</li>
                <li><strong>Obsłużone przez instancję backendu:</strong> {stats.instance}</li>
                <li><strong>Liczba obsłużonych żądań:</strong> {stats.requestCounter}</li>
                <li><strong>Czas serwera:</strong> {stats.serverTime}</li>
                <li><strong>Server uptime:</strong> {stats.uptime}</li>
                </ul>
            ) : <p>Ładowanie statystyk...</p>}
        </div>
    );
};


export default function App() {
    return (
        <Router>
            <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
                <nav style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
                    <Link to="/">Strona Główna</Link>
                    <Link to="/products">Produkty</Link>
                    <Link to="/stats">Statystyki</Link>
                </nav>
                <hr />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/stats" element={<Stats />} />
                </Routes>
            </div>
        </Router>
    );
}
