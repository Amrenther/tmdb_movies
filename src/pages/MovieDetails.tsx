import {useEffect , useState } from "react";
import { useParams } from "react-router-dom";
import { getMovieDetails } from "../api/tmdbApi";

interface MovieDetails {
    id: number,
    title: string,
    overview: string,
    release_date: string,
    genres: {id: number, name: string}[],
    poster_path: string
}

const MovieDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
    
    useEffect(() => {
        if (id) {
            getMovieDetails(Number(id)).then(data => {
                setMovieDetails(data);
            }) 
        }
    }, [id])


    return (
        <div className="min-h-screen bg-linear-to-r from-gray-900 to-gray-800 py-10 px-4 flex items-center justify-center">
            <div className="w-full max-w-4xl bg-gray-900 rounded-xl shadow-2xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Poster */}
                <div className="col-span-1 flex flex-col items-center justify-center">
                    <img
                        src={`https://image.tmdb.org/t/p/w500${movieDetails?.poster_path}`}
                        alt={movieDetails?.title}
                        className="w-full max-w-xs rounded-lg shadow-lg object-cover border-4 border-gray-800"
                    />
                </div>
                {/* Details */}
                <div className="col-span-2 flex flex-col justify-center">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{movieDetails?.title}</h1>
                    <div className="mb-4">
                        <span className="inline-block bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded-full mr-2 mb-2">Release Date: {movieDetails?.release_date}</span>
                        {movieDetails?.genres.map((genre) => (
                            <span key={genre.id} className="inline-block bg-gray-700 text-gray-200 text-xs font-semibold px-3 py-1 rounded-full mr-2 mb-2">
                                {genre.name}
                            </span>
                        ))}
                    </div>
                    <h2 className="text-xl font-bold text-gray-200 mb-2">Overview</h2>
                    <p className="text-gray-300 text-base leading-relaxed mb-6">
                        {movieDetails?.overview || 'No overview available.'}
                    </p>
                    <div className="mt-4">
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-400">
                            <div>
                                <dt className="font-semibold text-gray-300">Movie ID</dt>
                                <dd>{movieDetails?.id}</dd>
                            </div>
                            <div>
                                <dt className="font-semibold text-gray-300">Release Year</dt>
                                <dd>{movieDetails?.release_date ? movieDetails.release_date.split('-')[0] : '-'}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MovieDetails;