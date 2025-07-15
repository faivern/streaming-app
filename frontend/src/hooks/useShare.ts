import toast from 'react-hot-toast';
export default function useShare() {
    return () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            toast.success('Link copied!');
        });
    };
}
