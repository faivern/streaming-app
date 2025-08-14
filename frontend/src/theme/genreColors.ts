export const GENRE_COLORS: Record<number, string> = {
    28: "bg-gradient-to-br from-red-200/80 via-red-300/80 to-red-400/80 ring-red-300/60", // Action
    12: "bg-gradient-to-br from-sky-200/80 via-sky-300/80 to-sky-400/80 ring-sky-300/60", // Adventure
    16: "bg-gradient-to-br from-emerald-200/80 via-emerald-300/80 to-emerald-400/80 ring-emerald-300/60", // Animation
    35: "bg-gradient-to-br from-amber-200/80 via-amber-300/80 to-amber-400/80 ring-amber-300/60", // Comedy
    80: "bg-gradient-to-br from-slate-200/80 via-slate-300/80 to-slate-400/80 ring-slate-300/60", // Crime
    99: "bg-gradient-to-br from-lime-200/80 via-lime-300/80 to-lime-400/80 ring-lime-300/60", // Documentary
    18: "bg-gradient-to-br from-indigo-200/80 via-indigo-300/80 to-indigo-400/80 ring-indigo-300/60", // Drama
    10751: "bg-gradient-to-br from-teal-200/80 via-teal-300/80 to-teal-400/80 ring-teal-300/60", // Family
    14: "bg-gradient-to-br from-violet-200/80 via-violet-300/80 to-violet-400/80 ring-violet-300/60", // Fantasy
    36: "bg-gradient-to-br from-stone-200/80 via-stone-300/80 to-stone-400/80 ring-stone-300/60", // History
    27: "bg-gradient-to-br from-slate-200/80 via-slate-300/80 to-slate-500/80 ring-slate-300/60", // Horror
    10402: "bg-gradient-to-br from-fuchsia-200/80 via-pink-300/80 to-fuchsia-400/80 ring-pink-300/60", // Music
    9648: "bg-gradient-to-br from-purple-200/80 via-purple-300/80 to-purple-400/80 ring-purple-300/60", // Mystery
    10749: "bg-gradient-to-br from-rose-200/80 via-rose-300/80 to-rose-400/80 ring-rose-300/60", // Romance
    878: "bg-gradient-to-br from-cyan-200/80 via-teal-300/80 to-indigo-400/80 ring-teal-300/60", // Science Fiction
    10770: "bg-gradient-to-br from-gray-200/80 via-gray-300/80 to-gray-400/80 ring-gray-300/60", // TV Movie
    53: "bg-gradient-to-br from-blue-200/80 via-blue-300/80 to-blue-400/80 ring-blue-300/60", // Thriller
    10752: "bg-gradient-to-br from-red-200/80 via-amber-300/80 to-stone-400/80 ring-amber-300/60", // War
    37: "bg-gradient-to-br from-amber-200/80 via-orange-300/80 to-orange-400/80 ring-orange-300/60", // Western

    // Additional TV genres
    10759: "bg-gradient-to-br from-orange-200/80 via-red-300/80 to-rose-400/80 ring-red-300/60", // Action & Adventure
    10762: "bg-gradient-to-br from-pink-200/80 via-yellow-200/80 to-sky-300/80 ring-pink-300/60", // Kids
    10763: "bg-gradient-to-br from-blue-200/80 via-blue-300/80 to-slate-400/80 ring-blue-300/60", // News
    10764: "bg-gradient-to-br from-teal-200/80 via-lime-300/80 to-emerald-400/80 ring-lime-300/60", // Reality
    10765: "bg-gradient-to-br from-cyan-200/80 via-indigo-300/80 to-violet-400/80 ring-indigo-300/60", // Sci-Fi & Fantasy
    10766: "bg-gradient-to-br from-rose-200/80 via-pink-300/80 to-rose-400/80 ring-pink-300/60", // Soap
    10767: "bg-gradient-to-br from-indigo-200/80 via-sky-300/80 to-indigo-400/80 ring-indigo-300/60", // Talk
    10768: "bg-gradient-to-br from-red-200/80 via-amber-300/80 to-stone-400/80 ring-amber-300/60", // War & Politics
};

export const getGenreColor = (genreId: number): string => {
    return GENRE_COLORS[genreId] || "bg-gradient-to-br from-gray-200/80 via-gray-300/80 to-gray-400/80 ring-gray-300/60";
};