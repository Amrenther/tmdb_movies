import { tmdbClient } from "./tmdbClient";

export const getMovies = async(page: number , genreId: string ,searchMovie?: string) => {
    
    const url = searchMovie ? `/search/movie?query=${encodeURIComponent(searchMovie)}&page=${page}` : `/discover/movie?sort_by=popularity.desc&page=${page}&with_genres=${genreId}`;
    const response = await tmdbClient.get(url);
    return response.data;
}
    

export const getGenres = async() => {
    const response = await tmdbClient.get("/genre/movie/list");
    return response.data;
}

export const getMovieDetails = async(movieId: number) => {
    const response = await tmdbClient.get(`/movie/${movieId}`);
    return response.data;
}