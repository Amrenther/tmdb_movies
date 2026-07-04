import { tmdbClient } from "./tmdbClient";

export const getMovies = async(page: number , genreId: string ,searchMovie?: string) => {
    const url = searchMovie
        ? `/search/movie?query=${encodeURIComponent(searchMovie)}&page=${page}`
        : `/discover/movie?sort_by=popularity.desc&page=${page}&with_genres=${genreId}`;
    const response = await tmdbClient.get(url);
    return response.data;
}

export const getGenres = async() => {
    const response = await tmdbClient.get("/genre/movie/list");
    return response.data;
}

export const getTrendingMovies = async(timeWindow: "day" | "week" = "week") => {
    const response = await tmdbClient.get(`/trending/movie/${timeWindow}`);
    return response.data;
}

export const getTopRatedMovies = async() => {
    const response = await tmdbClient.get("/movie/top_rated");
    return response.data;
}

export const getNowPlayingMovies = async() => {
    const response = await tmdbClient.get("/movie/now_playing");
    return response.data;
}

export const getMovieDetails = async(movieId: number) => {
    const response = await tmdbClient.get(`/movie/${movieId}`);
    return response.data;
}

export const getMovieReviews = async(movieId: number) => {
    const response = await tmdbClient.get(`/movie/${movieId}/reviews`);
    return response.data;
}

export const getMovieVideos = async(movieId: number) => {
    const response = await tmdbClient.get(`/movie/${movieId}/videos`);
    return response.data;
}

export const getMovieImages = async(movieId: number) => {
    // include_image_language: null returns all languages including no language tag
    const response = await tmdbClient.get(`/movie/${movieId}/images`, {
        params: { include_image_language: "en,null" },
    });
    return response.data;
}

export const getSimilarMovies = async(movieId: number) => {
    const response = await tmdbClient.get(`/movie/${movieId}/similar`);
    return response.data;
}