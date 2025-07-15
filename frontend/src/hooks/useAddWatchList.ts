import toast from 'react-hot-toast';
export default function useAddWatchList() {
    return () => {
            toast.success('Added to Watchlist!');
        // add logic to actually add the item to the watchlist,
    };
}
