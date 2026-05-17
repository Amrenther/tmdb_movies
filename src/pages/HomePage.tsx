import { useNavigate } from "react-router-dom";
import { getMovies , getGenres } from "../api/tmdbApi";
import { useEffect , useState } from "react";



interface Movie {
    id: number,
    title: string,
    poster_path: string,
    release_date: string
}

interface Genre {
    id: number,
    name: string
}

const HomePage = () => {
    const navigate = useNavigate();

    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const[page, setPage] = useState(1);
    const[searchMovie, setSearchMovie] = useState('');
    const[genres, setGenres] = useState<Genre[]>([]);
    const[selectedGenre, setSelectedGenre] = useState('');


    useEffect(() => {
        getGenres().then((data) => {
            setGenres(data.genres);
        })
    },[])

    useEffect(() => {
        setLoading(true);   
        getMovies(page,selectedGenre,searchMovie).then((data) => {
            setMovies(data.results);
        }).finally(() => {
            setLoading(false);
        })
    },[page,selectedGenre,searchMovie])

    

    

    return (
        
        <div>
            <div className="flex flex-col gap-4">

                {/* Search Bar */}
                <input 
                    type="text" 
                    placeholder="Search movies..." 
                    className="bg-gray-800 text-white p-2 rounded-lg"
                    value={searchMovie}
                    onChange={(e) => setSearchMovie(e.target.value)}
                />

                {/* Genre Filter */}
                <select
                value={selectedGenre}
                onChange={(e) => 

                    {setSelectedGenre(e.target.value)
                    setPage(1)
                }}

                className="mb-3 bg-gray-800 text-white p-2 rounded-lg" >
                    <option value="">All Genres</option>
                    {genres.map((genre: Genre) => (
                        <option key={genre.id} value={genre.id}>{genre.name}</option>
                    ))}
                </select>
            </div>
            
            {/* All Movies */}

            {loading ? <p className="text-center text-xl">Loading...</p> : movies.length === 0 ? <p className="text-center text-xl">No movies found.</p> : null}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
                {movies.map((movie: Movie) => (
                <div key={movie.id}
                    className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                    <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title}/>
                    <h2 className="text-center mt-5 font-semibold">{movie.title}</h2>
                    <p className="text-center mt-2 mb-3 text-gray-400">{movie.release_date}</p>

                    <button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-b-lg"
                        onClick={() => navigate(`/movie/${movie.id}`)}
                    >
                        View Details
                    </button>
                </div>
            ))}
            </div>

            <div>
                
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-center col-span-full mt-6 space-x-4">
                <button 

                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}

                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
                
                >Previous</button>
                <h3 className="text-white">{page}</h3>
            <button 
            
            onClick={() => setPage(prev => prev + 1)}

            className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
            
            >Next</button>
            </div>
        </div>
    )
}

export default HomePage;