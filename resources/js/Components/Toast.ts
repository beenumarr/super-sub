import toast from 'react-hot-toast';

type ToastType = 'success' | 'error' | 'info' | 'default';

export default function notify(type: ToastType, message: string) {
    if (type === 'success') {
        toast.success(message);
        return;
    }

    if (type === 'error') {
        toast.error(message);
        return;
    }

    if (type === 'info') {
        toast(message);
        return;
    }

    toast(message);
}
